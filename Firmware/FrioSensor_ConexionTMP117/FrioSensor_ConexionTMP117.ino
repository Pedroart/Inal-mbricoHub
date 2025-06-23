#include <Wire.h>
#include "Adafruit_TMP117.h"
#include <Adafruit_Sensor.h>

Adafruit_TMP117 tmp117;
#define SDA_CUSTOM 5
#define SCL_CUSTOM 4

#define BUTTON_PIN 3

void setup() {

  if (checkBootButton()) {
    digitalWrite(LED_RED, LOW);   // 🔴 Encender LED (modo especial)
  } else {
    digitalWrite(LED_RED, HIGH);  // ⚫ Apagar LED (modo normal)
  }

  Serial.begin(115200);
  while (!Serial) delay(10); // Espera a que el puerto serial esté listo

  Wire.setPins(SDA_CUSTOM, SCL_CUSTOM);
  Wire.begin();

  Serial.println("Iniciando sensor TMP117...");

  if (!tmp117.begin(0x49)) {
    Serial.println("No se encontró el sensor TMP117. Verifica las conexiones.");
    while (1) delay(10);
  }

  Serial.println("Sensor TMP117 inicializado correctamente.");

  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
}

void loop() {
  sensors_event_t temp;
  tmp117.getEvent(&temp);
  Serial.print("Temperatura: ");
  Serial.print(temp.temperature);
  Serial.println(" °C");
  beaconFlash(LED_BLUE, 3, 100);
  delay(1000); // Espera 1 segundo antes de la próxima lectura
}

void beaconFlash(uint8_t pin, int times, int duration) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, LOW);  
    delay(duration);
    digitalWrite(pin, HIGH);
    delay(duration);
  }
}

bool checkBootButton() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // activa resistencia pull-up interna
  delay(10); // pequeño delay para estabilidad
  return digitalRead(BUTTON_PIN) == LOW; // presionado = LOW
}