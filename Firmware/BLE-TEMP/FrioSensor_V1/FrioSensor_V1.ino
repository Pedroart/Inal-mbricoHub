#include <Adafruit_TinyUSB.h>

// Pin del botón 3
const int BOTON3 = 3;   // cámbialo al pin real de tu diseño

// LEDs integrados en el nRF52840
#define LED_R LED_RED
#define LED_G LED_GREEN
#define LED_B LED_BLUE

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  Serial.println("🔍 Iniciando prueba de arranque...");

  // Configurar el botón
  pinMode(BOTON3, INPUT_PULLUP);  // botón a GND

  // Configurar LEDs como salida
  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);

  // Apagar todos los LEDs al inicio
  digitalWrite(LED_R, HIGH);
  digitalWrite(LED_G, HIGH);
  digitalWrite(LED_B, HIGH);

  delay(200); // pequeño retardo de estabilización al arrancar

  // Verificar si botón 3 está presionado
  if (digitalRead(BOTON3) == LOW) {
    Serial.println("✅ Botón 3 presionado en arranque → Modo VERDE");
    digitalWrite(LED_G, LOW); // encender verde
  } else {
    Serial.println("ℹ️ Botón 3 NO presionado → Modo AZUL");
    digitalWrite(LED_B, LOW); // encender azul
  }
}

void loop() {
  // Nada, el color se mantiene según estado de arranque
}
