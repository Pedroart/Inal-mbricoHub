from pymodbus.client import ModbusTcpClient

IP = "192.168.1.50"
PORT = 1502  # usa 502 si lo configuraste así

client = ModbusTcpClient(host=IP, port=PORT, timeout=3)
ok = client.connect()
print("connect():", ok)
if not ok:
    raise SystemExit("No se pudo conectar (¿server corriendo en la placa y puerto correcto?).")

# En pymodbus 3.x usa 'slave=' en lugar de 'unit='
rr = client.read_holding_registers(address=0, count=10, slave=1)
if rr.isError():
    print("Error:", rr)
else:
    print("Holding:", rr.registers)

client.close()
