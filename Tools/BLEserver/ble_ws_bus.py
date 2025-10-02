# ble_ws_bus.py
# Bus WebSocket con Bleak (API ≥ 0.20) y broadcast de eventos BLE.

import asyncio
import time
import json
from typing import Dict, Any, Set
from bleak import BleakScanner
import websockets

# ===== Config =====
HOST = "127.0.0.1"
PORT = 8765

FILTER_REQUIRE_MATCH = True   # exigir que CID == últimos 2 bytes de la MAC
SHOW_ONLY_WITH_CID = True     # ocultar anuncios sin manufacturer data
MIN_EVENT_INTERVAL_S = 0.2    # anti-spam por dispositivo (mínimo entre eventos)
PING_INTERVAL_S = 20          # ping websocket (mantener vivos NAT/conexiones)
CLIENT_QUEUE_MAX = 100        # backpressure por cliente

# ===== JSON rápido (orjson si está disponible) =====
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

# ===== Estado =====
devices: Dict[str, Dict[str, Any]] = {}
_last_emit_t: Dict[str, float] = {}

# Cada cliente tiene su propia cola de salida (no bloquea el scan)
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
    """Devuelve (ok, dict_evento) listo para broadcast o (False, None) si se filtra."""
    # 1) manufacturer data
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

    # 2) primer par (cid, payload)
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
            # Cliente lento: descartamos cola para evitar memoria infinita (estrategia simple)
            # Alternativa: drop oldest con get_nowait() en bucle.
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
    """Mantiene un snapshot sencillo de últimos datos por MAC."""
    mac = evt.get("address")
    if not mac:
        return
    rec = devices.get(mac, {})
    rec.update({
        "address": mac,
        "rssi": evt.get("rssi"),
        "cid": evt.get("cid"),
        "match": evt.get("match"),
        "raw": evt.get("raw"),
        "temp_c": evt.get("temp_c"),
        "bat_pct": evt.get("bat_pct"),
        "ts": evt.get("ts"),
    })
    devices[mac] = rec

# ===== Callback BLE (se ejecuta en hilo del loop de bleak) =====
def detection_callback(device, adv):
    ok, evt = device_payload(device, adv)
    if not ok:
        return

    # Anti-spam por dispositivo
    now = time.monotonic()
    last = _last_emit_t.get(device.address, 0.0)
    if (now - last) < MIN_EVENT_INTERVAL_S:
        return
    _last_emit_t[device.address] = now

    # Actualiza snapshot
    update_devices(evt)

    print(f"[BLE] {evt['address']} RSSI={evt['rssi']} "
          f"Temp={evt.get('temp_c')}°C Bat={evt.get('bat_pct')}% "
          f"Raw={evt.get('raw')}")

    # Broadcast
    try:
        msg = dumps(evt)
    except Exception:
        msg = dumps({"type": "event", "event": "adv_error"})
    # Lanzar tarea sin bloquear
    asyncio.get_event_loop().create_task(broadcast(msg))

# ===== Tarea: escritor por cliente =====
async def client_writer(client: Client):
    try:
        while True:
            msg = await client.queue.get()
            await client.ws.send(msg)
    except (asyncio.CancelledError, websockets.ConnectionClosed):
        pass

# ===== Handler WebSocket =====

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

    except websockets.ConnectionClosed:
        # cierre limpio o abrupto → no mostrar stacktrace
        print(f"[WS] Cliente desconectado: {ws.remote_address}")
    finally:
        writer_task.cancel()
        clients.discard(client)
        try:
            await writer_task
        except Exception:
            pass


# ===== Tarea: servidor WS =====
async def serve_ws():
    async with websockets.serve(
        ws_handler, HOST, PORT, ping_interval=PING_INTERVAL_S, ping_timeout=PING_INTERVAL_S*2
    ):
        print(f"WS listo en ws://{HOST}:{PORT}")
        await asyncio.Future()  # no termina

# ===== Tarea: escáner BLE =====
async def scan_task():
    scanner = BleakScanner(detection_callback)
    await scanner.start()
    print("Escaneo BLE iniciado")
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
