#include <bluefruit.h>

#define MANUFACTURER_ID 0x005C  // ID de Apple para iBeacon

// UUID del beacon (puedes personalizarlo)
uint8_t beaconUuid[16] = {
  0xE2, 0xC5, 0x6D, 0xB5,
  0xDF, 0xFB,
  0x48, 0xD2,
  0xB0, 0x60,
  0xD0, 0xF5, 0xA7, 0x10, 0x96, 0xE0
};

BLEBeacon beacon;

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  Serial.println("Configurando Beacon BLE con Major y Minor personalizados");

  // Inicializar Bluefruit
  Bluefruit.begin();

  ble_gap_addr_t addr;
  sd_ble_gap_addr_get(&addr);
  Serial.print("MAC BLE: ");
  for (int i = 5; i >= 0; i--) {
    if (addr.addr[i] < 0x10) Serial.print("0");
    Serial.print(addr.addr[i], HEX);
    if (i > 0) Serial.print(":");
  }
  Serial.println();

  Bluefruit.setTxPower(4);    // Potencia de transmisión en dBm
  Bluefruit.setName("BeaconPersonalizado");

  // Configurar el beacon
  beacon.setManufacturer(MANUFACTURER_ID);
  beacon.setUuid(beaconUuid);
  beacon.setMajorMinor(1234, 5678);  // Establecer Major y Minor
  beacon.setRssiAt1m(-54);           // RSSI a 1 metro

  // Configurar la publicidad
  Bluefruit.Advertising.setBeacon(beacon);
  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(160, 160); // Intervalo de 100 ms
  Bluefruit.Advertising.setFastTimeout(30);    // Tiempo de publicidad rápida
  Bluefruit.Advertising.start();
}

void loop() {

}
