import noble from '@abandonware/noble';
import { BeaconPacket } from '../../models/Sensor.js';
import { AppModule } from '../../AppModule.js';
import type { ModuleContext } from '../../ModuleContext.js';

export class BLEScannerService implements AppModule {
  private static lecturas: BeaconPacket[] = [];
  private static readonly DEVICE_NAME = "FrioSensor";

  static start() {
    noble.on('stateChange', async (state) => {
      if (state === 'poweredOn') {
        await noble.startScanningAsync([], true);
        console.log("🔍 BLE scanner started");
      } else {
        console.log(`⚠️ BLE adapter state changed: ${state}`);
        noble.stopScanning();
      }
    });

    noble.on('discover', (peripheral) => {
      const nombre = peripheral.advertisement.localName;
      const mac = peripheral.address;
      const rssi = peripheral.rssi;
      const data = peripheral.advertisement.manufacturerData;

      if (nombre !== BLEScannerService.DEVICE_NAME) return;
      if (!data || data.length < 5) return;

      console.log(`📡 Detectado: ${nombre || "(sin nombre)"} | MAC: ${mac} | RSSI: ${rssi}`);
      

      const codigoBle = data.readUInt16LE(0);
      const tempRaw = data.readUInt16BE(2);
      const bateria = data.readUInt8(4);

      const temp = tempRaw / 100;

      console.log(`   ↪ ManufacturerData: ${codigoBle} ${tempRaw}`);

      BLEScannerService._updateLectura({ codigoBle, temp, bateria, timestamp: Date.now() });
    });
  }

  private static _updateLectura(nueva: BeaconPacket) {
    const idx = this.lecturas.findIndex(p => p.codigoBle === nueva.codigoBle);
    if (idx >= 0) {
      this.lecturas[idx] = nueva;
    } else {
      this.lecturas.push(nueva);
    }

    const ahora = Date.now();
    this.lecturas = this.lecturas.filter(p => ahora - p.timestamp < 15000);
  }

  static getLecturas(): BeaconPacket[] {
    return this.lecturas;
  }

  enable(ctx: ModuleContext): void {
    BLEScannerService.start();
  }
}
