/*
Board: Seed XIA nRF52840


*/

#include <Arduino.h>
#include "Adafruit_SPIFlash.h"
#include <nrf.h>
#include <nrf_power.h>
#include <nrf_gpio.h>

#include <Wire.h>
#include "Adafruit_TMP117.h"
#include <Adafruit_Sensor.h>
#include <bluefruit.h>

#define LED_PIN        LED_BLUE
#define REBOOT_TIME_S  10

#define ENABLE_LOGS true

#if ENABLE_LOGS
  #define LOG_PRINT(x)   Serial.print(x)
  #define LOG_PRINTLN(x) Serial.println(x)
  #define LOG_PRINTF(...) Serial.printf(__VA_ARGS__)
#else
  #define LOG_PRINT(x)
  #define LOG_PRINTLN(x)
  #define LOG_PRINTF(...)
#endif


Adafruit_FlashTransport_QSPI flashTransport;
extern "C" uint32_t sd_softdevice_disable(void);

// Inicia el reloj de baja frecuencia
void lfclk_start() {
  NRF_CLOCK->LFCLKSRC = CLOCK_LFCLKSRC_SRC_RC << CLOCK_LFCLKSRC_SRC_Pos;
  NRF_CLOCK->EVENTS_LFCLKSTARTED = 0;
  NRF_CLOCK->TASKS_LFCLKSTART = 1;
  while (!NRF_CLOCK->EVENTS_LFCLKSTARTED);
  nrf_gpio_cfg_default(0);
  nrf_gpio_cfg_default(1);
}

// Deshabilita todos los GPIOs no usados
void disableGPIOs(uint8_t start, uint8_t end) {
  for (uint32_t i = start; i <= end; i++) {
    if (i == 0 || i == 1 || i == 26 || i == 30 || i == 6) continue;
    nrf_gpio_cfg_input(i, NRF_GPIO_PIN_PULLUP);
  }
}

// Configura RTC2 para generar reset tras cierto tiempo
void rtc2_init(uint32_t seconds) {
  lfclk_start();
  NRF_RTC2->PRESCALER = 1;
  NRF_RTC2->CC[0] = seconds * 32768UL;
  NRF_RTC2->EVTENSET = RTC_EVTENSET_COMPARE0_Msk;
  NRF_RTC2->INTENSET = RTC_INTENSET_COMPARE0_Msk;
  NVIC_EnableIRQ(RTC2_IRQn);
  NRF_RTC2->TASKS_START = 1;
}

// Interrupción del RTC2 para reiniciar
extern "C" void RTC2_IRQHandler(void) {
  if (NRF_RTC2->EVENTS_COMPARE[0]) {
    NRF_RTC2->EVENTS_COMPARE[0] = 0;
    NVIC_SystemReset();
  }
}

// Función principal encapsulada
void lowPowerSingleCycle() {
  // Señal de arranque
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  delay(100);
  digitalWrite(LED_PIN, HIGH);

  // Desactiva SoftDevice y periféricos
  sd_softdevice_disable();
  SysTick->CTRL = 0;
  NRF_CLOCK->TASKS_HFCLKSTOP = 1;

  // Apaga periféricos
  NRF_UICR->REGOUT0 = 0xFFFFFFFE;
  flashTransport.begin();
  flashTransport.runCommand(0xB9); // Deep Power Down
  flashTransport.end();

  NRF_POWER->DCDCEN0 = 1;
  NRF_POWER->DCDCEN = 1;

  NRF_USBD->ENABLE = 0;
  NRF_USBD->USBPULLUP = 0;
  NRF_GPIO->PIN_CNF[24] = 0;
  NRF_GPIO->PIN_CNF[25] = 0;

  NRF_NFCT->TASKS_DISABLE = 1;
  NRF_NFCT->INTENCLR = 0xFFFFFFFF;

  NRF_UARTE0->ENABLE = 0;
  NRF_UARTE1->ENABLE = 0;
  NRF_RNG->TASKS_STOP = 1;
  NRF_RNG->INTENCLR = 0xFFFFFFFF;

  NRF_RADIO->TASKS_DISABLE = 1;
  NRF_CRYPTOCELL->ENABLE = 0;

  NRF_TIMER1->TASKS_STOP = 1;
  NRF_TIMER2->TASKS_STOP = 1;
  NRF_TIMER3->TASKS_STOP = 1;
  NRF_TIMER4->TASKS_STOP = 1;

  NRF_RTC0->TASKS_STOP = 1;
  NRF_RTC1->TASKS_STOP = 1;

  // Apaga GPIOTE y PPI
  for (int i = 0; i < 8; i++) NRF_GPIOTE->CONFIG[i] = 0;
  NRF_PPI->CHEN = 0;

  disableGPIOs(0, 30);
  for (uint32_t i = 32; i <= 47; i++) {
    if (i == 41 || i == 42) continue;
    nrf_gpio_cfg_input(i, NRF_GPIO_PIN_PULLUP);
  }

  // Configura RTC2 para reinicio tras tiempo
  rtc2_init(REBOOT_TIME_S);

  // Apaga LED interno
  pinMode(LED_BUILTIN, INPUT);

  // Entra en modo de bajo consumo
  __SEV();
  __WFE();
  __WFE();
}

void setup() {
  #if ENABLE_LOGS
    Serial.begin(115200);
    while (!Serial) delay(10);
    LOG_PRINTLN("Logs habilitados");
  #endif

  run();
  lowPowerSingleCycle();
}

void loop() {
  __WFI(); // No hace nada más
}

/////////////////////////////////////////////////////////////

#define VBAT_PIN A2
#define SDA_CUSTOM 5
#define SCL_CUSTOM 4
#define BUTTON_PIN 3
Adafruit_TMP117 tmp117;

uint8_t beaconData[5] = {
  0x00,   // ID del paquete
  0x00,   // ID del paquete
  0xAA,   // Temp high byte
  0xAA,   // Temp low byte
  0xAA    // Ej. nivel batería o relleno
};


void run(){
  Wire.setPins(SDA_CUSTOM, SCL_CUSTOM);
  Wire.begin();
  
  if (!checkBootButton()) {
    BeaconSetup();

    leerBateria();
    if (!tmp117.begin(0x49)) {
      beaconFlash(LED_RED, 5, 100);
      startAdvertising();
      delay(100);
      return;
    }
    getTemperatureBytes();


    startAdvertising();
    beaconFlash(LED_PIN, 3, 100);
    delay(100);
  } else {
    beaconFlash(LED_GREEN, 3, 100);
  }

}

void BeaconSetup(){
  Bluefruit.begin();
  Bluefruit.setTxPower(4);
  Bluefruit.setName("FrioSensor");
}

void getManufacturerIDFromMAC() {
  ble_gap_addr_t mac;
  sd_ble_gap_addr_get(&mac);
  beaconData[0] = mac.addr[0];  // Últimos 2 bytes
  beaconData[1] = mac.addr[1];  // Últimos 2 bytes
}


void updateBeaconData() {
  Bluefruit.Advertising.clearData();
  getManufacturerIDFromMAC();
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();
  Bluefruit.Advertising.addManufacturerData(beaconData, sizeof(beaconData));
  Bluefruit.Advertising.addName();

  Bluefruit.Advertising.start(0);
}

void startAdvertising() {
  Bluefruit.Advertising.stop();
  updateBeaconData();

  Bluefruit.Advertising.setInterval(160, 160); // 100ms
  Bluefruit.Advertising.setFastTimeout(0);
  Bluefruit.Advertising.start(0);
}

bool checkBootButton() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // activa resistencia pull-up interna
  delay(10); // pequeño delay para estabilidad
  return digitalRead(BUTTON_PIN) == LOW; // presionado = LOW
}

void getTemperatureBytes() {
  sensors_event_t temp;
  tmp117.getEvent(&temp);

  int16_t tempInt = roundf(temp.temperature * 100);  // ejemplo: 23.75 → 2375
  LOG_PRINT("Tem raw: ");
  LOG_PRINTLN(tempInt);
  beaconData[2] = (tempInt >> 8) & 0xFF;
  beaconData[3]  = tempInt & 0xFF;
}


void beaconFlash(uint8_t pin, int times, int duration) {
  pinMode(pin, OUTPUT);
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, LOW);  
    delay(duration);
    digitalWrite(pin, HIGH);
    delay(duration);
  }
  pinMode(pin, INPUT);
}

void leerBateria() {
  const float voltajeMax = 3.0;
  const float refVoltage = 3.6;
  const float divisorFactor = 2.0;

  analogReadResolution(12);
  pinMode(VBAT_PIN, INPUT);

  uint16_t raw = analogRead(VBAT_PIN);
  float vSample = (raw / 4095.0) * refVoltage;
  float vBat = vSample * divisorFactor;
  uint8_t batteryPct = min(100, (uint8_t)(vBat / voltajeMax * 100.0));
  beaconData[4] = batteryPct;

  LOG_PRINT("ADC raw: ");
  LOG_PRINTLN(raw);
  LOG_PRINT("Voltaje: ");
  LOG_PRINTLN(vBat);
  LOG_PRINT("Bateria %: ");
  LOG_PRINTLN(batteryPct);
}
