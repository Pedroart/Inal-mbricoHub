#include <bluefruit.h>

uint32_t lastWakeTime = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  // Reduce consumo con DC/DC activado
  sd_power_dcdc_mode_set(NRF_POWER_DCDC_ENABLE);

  Serial.println("Inicializado. Entrando en ciclos de sueño de 30s...");
  lastWakeTime = millis();
}

void loop() {
  Serial.println("¡Estoy despierto!");
  digitalWrite(LED_BUILTIN, LOW);
  delay(100);  // visible
  digitalWrite(LED_BUILTIN, HIGH);

  // Dormir hasta cumplir 30 segundos desde último ciclo
  while (millis() - lastWakeTime < 30000) {
    sd_app_evt_wait();  // modo bajo consumo
  }

  lastWakeTime = millis();  // actualizar el tiempo de referencia
}
