# pip install bleak
import asyncio
import time
from bleak import BleakScanner

# === Config ===
TARGET_INTERVAL_S = 30.0            # objetivo de muestreo
TOLERANCE_S = 5.0                   # margen permitido
PRINT_PERIOD_S = 2.0                # refresco de tabla
FILTER_REQUIRE_MATCH = True         # exigir CID == últimos 2 bytes de la MAC
SHOW_ONLY_WITH_CID = True           # ocultar anuncios sin manufacturer data

# Ignorar "micro-envíos" (bursts)
IGNORE_INTERVAL_BELOW_S = 0.8       # descarta paquetes si llegaron antes de este intervalo
IGNORE_SAME_PAYLOAD_WITHIN_S = 2.0  # (opcional) descarta payload idéntico dentro de esta ventana

EMA_ALPHA = 0.3                     # suavizado para promedio de intervalo

# address -> estado
devices = {}
# estado: {
#   'cid': int,
#   'last_accept_t': float | None,   # última muestra ACEPTADA
#   'last_interval': float | None,
#   'ema_interval': float | None,
#   'temp': float | None,
#   'bat': int | None,
#   'rssi': int | None,
#   'match': bool,
#   'last_raw': bytes | None,        # último payload aceptado
#   'last_seen_t': float | None,     # último anuncio visto (aceptado o no)
# }

def mac_last2_to_int(addr: str) -> int | None:
    parts = addr.split(":")
    if len(parts) != 6:
        return None
    return int(parts[-2] + parts[-1], 16)

def parse_raw_temp_bat(raw: bytes):
    # RAW esperado: [tempH, tempL, bat]
    if not raw or len(raw) < 3:
        return None, None
    temp_raw = (raw[0] << 8) | raw[1]
    if temp_raw & 0x8000:
        temp_raw = -((temp_raw ^ 0xFFFF) + 1)
    return temp_raw / 100.0, raw[2]

def status_for_interval(iv):
    if iv is None:
        return "—"
    if abs(iv - TARGET_INTERVAL_S) <= TOLERANCE_S:
        return "OK"
    return "OFF"

def detection_callback(dev, adv):
    # 1) manufacturer data
    if not adv.manufacturer_data:
        if not SHOW_ONLY_WITH_CID:
            pass
        return

    # 2) primer par (CID, payload)
    cid, raw = None, None
    for k, v in adv.manufacturer_data.items():
        cid, raw = k, v
        break
    if cid is None:
        return

    # 3) comparación con MAC
    mac2 = mac_last2_to_int(dev.address)
    match = (mac2 == cid) if mac2 is not None else False
    if FILTER_REQUIRE_MATCH and not match:
        return

    now = time.monotonic()
    st = devices.get(dev.address)
    if st is None:
        st = {
            'cid': cid,
            'last_accept_t': None,
            'last_interval': None,
            'ema_interval': None,
            'temp': None,
            'bat': None,
            'rssi': adv.rssi,
            'match': match,
            'last_raw': None,
            'last_seen_t': now,
        }
        devices[dev.address] = st
    else:
        st['last_seen_t'] = now
        st['rssi'] = adv.rssi
        st['match'] = match
        st['cid'] = cid

    # 4) anti-burst: si hay última muestra aceptada, calcula Δt respecto a esa
    if st['last_accept_t'] is not None:
        delta = now - st['last_accept_t']
        # ignora si llegó demasiado rápido
        if delta < IGNORE_INTERVAL_BELOW_S:
            return

    # 5) deduplicación por payload idéntico en ventana corta
    if st['last_raw'] is not None and raw == st['last_raw']:
        if st['last_accept_t'] is not None and (now - st['last_accept_t']) < IGNORE_SAME_PAYLOAD_WITHIN_S:
            return

    # 6) parsear y ACEPTAR muestra
    temp_c, bat = parse_raw_temp_bat(raw)

    # actualizar intervalos (solo con muestras aceptadas)
    if st['last_accept_t'] is None:
        st['last_interval'] = None
        st['ema_interval'] = None
    else:
        interval = now - st['last_accept_t']
        st['last_interval'] = interval
        st['ema_interval'] = interval if st['ema_interval'] is None else (
            EMA_ALPHA * interval + (1 - EMA_ALPHA) * st['ema_interval']
        )

    st['last_accept_t'] = now
    st['temp'] = temp_c
    st['bat'] = bat
    st['last_raw'] = raw

def fmt(v, w):
    s = v if isinstance(v, str) else (f"{v}" if v is not None else "—")
    return s.ljust(w)[:w]

async def printer_loop():
    while True:
        await asyncio.sleep(PRINT_PERIOD_S)
        print("\033c", end="")
        print(
            f"{fmt('MAC',18)}  {fmt('CID',8)}  {fmt('match',5)}  "
            f"{fmt('Δt(s)',7)}  {fmt('avg(s)',7)}  "
            f"{fmt('Temp(°C)',9)}  {fmt('Bat%',5)}  {fmt('RSSI',5)}  {fmt('estado',5)}"
        )
        print("-"*90)
        for mac in sorted(devices.keys()):
            st = devices[mac]
            cid_str = f"0x{st['cid']:04X}" if st['cid'] is not None else "—"
            match_str = "YES" if st['match'] else "NO"
            dt = st['last_interval']
            avg = st['ema_interval']
            dt_str = f"{dt:.1f}" if dt is not None else "—"
            avg_str = f"{avg:.1f}" if avg is not None else "—"
            t_str = f"{st['temp']:.2f}" if st['temp'] is not None else "—"
            b_str = f"{st['bat']}" if st['bat'] is not None else "—"
            rssi_str = f"{st['rssi']}" if st['rssi'] is not None else "—"
            state = status_for_interval(avg if avg is not None else dt)
            print(
                f"{fmt(mac,18)}  {fmt(cid_str,8)}  {fmt(match_str,5)}  "
                f"{fmt(dt_str,7)}  {fmt(avg_str,7)}  "
                f"{fmt(t_str,9)}  {fmt(b_str,5)}  {fmt(rssi_str,5)}  {fmt(state,5)}"
            )

async def main():
    scanner = BleakScanner()
    scanner.register_detection_callback(detection_callback)
    print("Escaneando... Ctrl+C para salir")
    await scanner.start()
    try:
        await printer_loop()
    except KeyboardInterrupt:
        pass
    finally:
        await scanner.stop()

if __name__ == "__main__":
    asyncio.run(main())
