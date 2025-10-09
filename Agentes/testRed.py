# scan_lan_ports.py — busca IPs con puerto 80 o 502 abiertos en la subred
import socket

SUBRED = "192.168.0."   # ajusta según tu LAN (p.ej. "192.168.0.")
PUERTOS = [80, 502]
socket.setdefaulttimeout(0.15)

def abierto(ip, port):
    try:
        s = socket.socket()
        s.connect((ip, port))
        s.close()
        return True
    except:
        return False

halladas = []
for i in range(50, 255):
    ip = f"{SUBRED}{i}"
    flags = [p for p in PUERTOS if abierto(ip, p)]
    if flags:
        halladas.append((ip, flags))
        print("Posible dispositivo:", ip, "puertos:", flags)

print("Hecho. Candidatas:", halladas)
