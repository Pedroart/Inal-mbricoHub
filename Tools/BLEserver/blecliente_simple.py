# pip install bleak
import asyncio
from bleak import BleakScanner

FILTER_REQUIRE_MATCH = True
SHOW_ONLY_WITH_CID = True

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

def detection_callback(device, adv):
    # 1) verificar si hay manufacturer data
    if not adv.manufacturer_data:
        if SHOW_ONLY_WITH_CID:
            return
        print(f"{device.address}  RSSI {adv.rssi} (sin MFD)")
        return

    # 2) tomar primer par (cid, payload)
    cid, raw = next(iter(adv.manufacturer_data.items()))
    mac2 = mac_last2_to_int(device.address)
    match = (mac2 == cid) if mac2 is not None else False

    if FILTER_REQUIRE_MATCH and not match:
        return

    temp_c, bat, ok = parse_raw_temp_bat(raw)
    cid_str = f"0x{cid:04X}"
    tag = "MATCH" if match else "NO-MATCH"

    if ok:
        print(f"{device.address}  CID={cid_str}  {tag}  RSSI={adv.rssi:>3}  "
              f"T={temp_c:.2f}°C  Bat={bat}%  raw={raw.hex()}")
    else:
        print(f"{device.address}  CID={cid_str}  {tag}  RSSI={adv.rssi:>3}  raw={raw.hex()}")

async def main():
    scanner = BleakScanner(detection_callback)  # ✅ API nueva
    print("Escaneando... Ctrl+C para salir")
    await scanner.start()
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        await scanner.stop()

if __name__ == "__main__":
    asyncio.run(main())
