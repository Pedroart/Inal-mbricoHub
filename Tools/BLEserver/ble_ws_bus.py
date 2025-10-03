# ble_ws_bus.py
# Bus WebSocket con Bleak (API ≥ 0.20) y broadcast de eventos BLE.

import asyncio
import time
import json
from typing import Dict, Any, Set, Optional, List
from bleak import BleakScanner, BleakClient
import websockets

# ===== Config =====
HOST = "127.0.0.1"
PORT = 8765

FILTER_REQUIRE_MATCH = True   # exigir que CID == últimos 2 bytes de la MAC
SHOW_ONLY_WITH_CID = True     # ocultar anuncios sin manufacturer data
MIN_EVENT_INTERVAL_S = 0.2    # anti-spam por dispositivo (mínimo entre eventos)
PING_INTERVAL_S = 20          # ping websocket (mantener vivos NAT/conexiones)
CLIENT_QUEUE_MAX = 100        # backpressure por cliente
FILTER_NAME_PREFIX = "FrioSensor-"

# ===== JSON rápido =====
try:
    import orjson
    def dumps(obj: Any) -> bytes:
        return orjson.dumps(obj)
    def dumps_str(obj: Any) -> str:
        return orjson.dumps(obj).decode("utf-8")
except Exception:
    def dumps(obj: Any) -> bytes:
        return json.dumps(obj, separators=(",", ":")).encode("utf-8")
    def dumps_str(obj: Any) -> str:
        return json.dumps(obj, separators=(",", ":"))

# ===== Estado (bus principal) =====
devices: Dict[str, Dict[str, Any]] = {}
_last_emit_t: Dict[str, float] = {}

# ===== Snapshot filtrado FrioSensor-* (alimentado por el escáner principal) =====
class FilteredSnapshot:
    def __init__(self):
        self.devices: Dict[str, Dict[str, Any]] = {}
        self._last_emit_t: Dict[str, float] = {}

    def feed(self, device, adv):
        """Recibe device/adv del escáner principal y guarda solo FrioSensor-* con antispam."""
        name = device.name or adv.local_name or ""
        if not name.startswith(FILTER_NAME_PREFIX):
            return
        now = time.monotonic()
        last = self._last_emit_t.get(device.address, 0.0)
        if (now - last) < MIN_EVENT_INTERVAL_S:
            return
        self._last_emit_t[device.address] = now
        self.devices[device.address] = {
            "address": device.address,
            "name": name,
            "rssi": adv.rssi,
            "ts": time.time(),
        }

    async def list(self) -> List[Dict[str, Any]]:
        return list(self.devices.values())

    async def connect_try(self, address: str, timeout: float = 10.0) -> Dict[str, Any]:
        if address not in self.devices:
            return {"success": False, "error": "Device not found"}
        try:
            async with BleakClient(address, timeout=timeout) as client:
                ok = await client.is_connected()
                return {
                    "success": ok,
                    "address": address,
                    "name": self.devices[address]["name"],
                    "services": [s.uuid for s in client.services] if ok else []
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

_filtered = FilteredSnapshot()

# ===== WS: cada cliente con su cola (no bloquea el scan) =====
class Client:
    def __init__(self, ws: websockets.WebSocketServerProtocol):
        self.ws = ws
        self.queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=CLIENT_QUEUE_MAX)

clients: Set[Client] = set()

# ===== Utilidades =====
def mac_last2_to_int(addr: str) -> int | None:
    parts = addr.split(":")
    if len(parts) != 6:
        return None
    return int(parts[-2] + parts[-1], 16)

def parse_raw_temp_bat(raw: bytes):
    """ RAW esperado: [tempH, tempL, bat] -> (°C, %, ok) """
    if not raw or len(raw) < 3:
        return None, None, False
    temp_raw = (raw[0] << 8) | raw[1]
    if temp_raw & 0x8000:  # signo
        temp_raw = -((temp_raw ^ 0xFFFF) + 1)
    return temp_raw / 100.0, int(raw[2]), True

def device_payload(device, adv):
    """Devuelve (ok, dict_evento) listo para broadcast o (False, None) si se filtra por CID)."""
    if not adv.manufacturer_data:
        if SHOW_ONLY_WITH_CID:
            return False, None
        return True, {
            "type": "event",
            "event": "adv",
            "address": device.address,
            "rssi": adv.rssi,
            "has_mfd": False,
            "ts": time.time(),
        }

    cid, raw = next(iter(adv.manufacturer_data.items()))
    mac2 = mac_last2_to_int(device.address)
    match = (mac2 == cid) if mac2 is not None else False
    if FILTER_REQUIRE_MATCH and not match:
        return False, None

    temp_c, bat, ok = parse_raw_temp_bat(raw)
    evt = {
        "type": "event",
        "event": "adv",
        "address": device.address,
        "rssi": adv.rssi,
        "cid": f"0x{cid:04X}",
        "match": match,
        "raw": raw.hex(),
        "ts": time.time(),
    }
    if ok:
        evt["temp_c"] = round(float(temp_c), 2)
        evt["bat_pct"] = int(bat)
    return True, evt

async def broadcast(msg_bytes: bytes):
    """Empuja a todos los clientes sin bloquear el escaneo."""
    stale: Set[Client] = set()
    for c in clients:
        try:
            c.queue.put_nowait(msg_bytes)
        except asyncio.QueueFull:
            try:
                while not c.queue.empty():
                    c.queue.get_nowait()
                c.queue.put_nowait(msg_bytes)
            except Exception:
                stale.add(c)
    for c in stale:
        try:
            await c.ws.close()
        except Exception:
            pass
        clients.discard(c)

def update_devices(evt: Dict[str, Any]):
    mac = evt.get("address")
    if not mac:
        return
    rec = devices.get(mac, {})
    rec.update(evt)
    devices[mac] = rec

# ===== Callback BLE (único escáner) =====
def detection_callback(device, adv):
    # Alimentar snapshot filtrado SIEMPRE (aunque no pase filtros del bus principal)
    _filtered.feed(device, adv)

    # Procesar el bus principal con device_payload
    ok, evt = device_payload(device, adv)
    if not ok:
        return

    # Anti-spam (bus principal)
    now = time.monotonic()
    last = _last_emit_t.get(device.address, 0.0)
    if (now - last) < MIN_EVENT_INTERVAL_S:
        return
    _last_emit_t[device.address] = now

    # Actualiza snapshot del bus principal
    update_devices(evt)

    # Log y broadcast
    print(
        f"[BLE] {evt['address']} RSSI={evt['rssi']} "
        f"Temp={evt.get('temp_c')}°C Bat={evt.get('bat_pct')}% Raw={evt.get('raw')}"
    )
    try:
        msg = dumps(evt)
    except Exception:
        msg = dumps({"type": "event", "event": "adv_error"})
    asyncio.get_event_loop().create_task(broadcast(msg))

# ===== Writer por cliente =====
async def client_writer(client: Client):
    try:
        while True:
            msg = await client.queue.get()
            await client.ws.send(msg)
    except (asyncio.CancelledError, websockets.ConnectionClosed):
        pass

# ===== WS Handler =====
async def ws_handler(ws):
    client = Client(ws)
    clients.add(client)
    writer_task = asyncio.create_task(client_writer(client))
    try:
        await ws.send(dumps({"type": "hello", "version": 1, "note": "BLE WS Bus listo"}))
        async for message in ws:
            try:
                data = json.loads(message)
            except Exception:
                continue

            typ = data.get("type")
            if typ == "get_devices":
                await ws.send(dumps({"type": "devices", "data": devices}))
            elif typ == "ping":
                await ws.send(dumps({"type": "pong", "ts": time.time()}))
            elif typ == "scan_list":
                lst = await _filtered.list()
                await ws.send(dumps({"type": "scan_devices", "data": lst}))
            elif typ == "scan_connect":
                addr = data.get("address")
                res = await _filtered.connect_try(addr)
                await ws.send(dumps({"type": "scan_connect_result", "data": res}))
    except websockets.ConnectionClosed:
        print(f"[WS] Cliente desconectado: {ws.remote_address}")
    finally:
        writer_task.cancel()
        clients.discard(client)
        try:
            await writer_task
        except Exception:
            pass

# ===== Servidor y tareas =====
async def serve_ws():
    async with websockets.serve(
        ws_handler, HOST, PORT, ping_interval=PING_INTERVAL_S, ping_timeout=PING_INTERVAL_S*2
    ):
        print(f"WS listo en ws://{HOST}:{PORT}")
        await asyncio.Future()

async def scan_task():
    scanner = BleakScanner(detection_callback)
    await scanner.start()
    print("Escaneo BLE (único) iniciado")
    try:
        await asyncio.Future()
    finally:
        await scanner.stop()

# ===== Main =====
async def main():
    await asyncio.gather(serve_ws(), scan_task())

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
