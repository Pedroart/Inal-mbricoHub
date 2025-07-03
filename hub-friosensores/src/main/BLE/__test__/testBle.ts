import { BLEScannerService } from '../BLEScannerService';

async function main() {
  BLEScannerService.start();

  // Mostrar lecturas cada 5 segundos
  setInterval(() => {
    const lecturas = BLEScannerService.getLecturas();
    console.clear();
    console.log("Lecturas BLE actuales:");
    console.table(lecturas);
  }, 5000);
}

main();
