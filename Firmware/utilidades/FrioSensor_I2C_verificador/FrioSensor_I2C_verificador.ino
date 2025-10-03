#include <Wire.h>


// Reemplaza por los pines correctos de tu hardware
#define SDA_CUSTOM 5
#define SCL_CUSTOM 4

// Usa el segundo periférico I2C del nRF52840

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);  // Espera a que el puerto serial esté listo

  Serial.println("⏳ Iniciando escaneo I2C con pines personalizados...");

  // Iniciar el bus I2C con los pines especificados en el constructor
  Wire.setPins(SDA_CUSTOM, SCL_CUSTOM);
  Wire.begin();

  scanI2CDevices();
}

void loop() {
  // No hace nada en loop
}

void scanI2CDevices() {
  byte error, address;
  int count = 0;

  for (address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0) {
      Serial.print("✅ Dispositivo I2C encontrado en dirección 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
      count++;
    } else if (error == 4) {
      Serial.print("⚠️ Error desconocido en dirección 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
    }
  }

  if (count == 0)
    Serial.println("❌ No se encontraron dispositivos I2C.");
  else
    Serial.println("✔️ Escaneo completado.");
}
