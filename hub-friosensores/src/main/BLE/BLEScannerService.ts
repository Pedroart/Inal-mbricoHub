import noble from '@abandonware/noble';


interface BeaconPacket {
  codigoBle: number;
  temp: number;
  bateria: number;
  timestamp: number;
}

export class BLEScannerService {
  private static lecturas: BeaconPacket[] = [];
  private static readonly DEVICE_NAME = "FrioSensor"; // Nombre fijo que configuras en `Bluefruit.Advertising.addName()`

  static start() {
    noble.on('stateChange', async (state) => {
      if (state === 'poweredOn') {
        await noble.startScanningAsync([], true); // Escaneo continuo con duplicados
        console.log("BLE scanner started");
      }
    });

    noble.on('discover', (peripheral) => {
      const nombre = peripheral.advertisement.localName;
      //console.log(nombre);
      if (nombre !== BLEScannerService.DEVICE_NAME) return;

      const data = peripheral.advertisement.manufacturerData;
      if (!data || data.length < 5) return;

      const codigoBle = data.readUInt16LE(0);
      const tempRaw = data.readUInt16BE(2);
      const bateria = data.readUInt8(4);

      const temp = tempRaw / 100;

      BLEScannerService._updateLectura({ codigoBle, temp, bateria, timestamp: Date.now() });
    });
  }

  private static _updateLectura(nueva: BeaconPacket) {
    // Reemplaza si ya existe o agrega
    const idx = this.lecturas.findIndex(p => p.codigoBle === nueva.codigoBle);
    if (idx >= 0) {
      this.lecturas[idx] = nueva;
    } else {
      this.lecturas.push(nueva);
    }

    // Elimina lecturas viejas (opcional, por limpieza)
    const ahora = Date.now();
    this.lecturas = this.lecturas.filter(p => ahora - p.timestamp < 15000); // Mantén solo las de los últimos 15s
  }

  static getLecturas(): BeaconPacket[] {
    return this.lecturas;
  }
}
