#include <Arduino.h>
#include "Adafruit_SPIFlash.h"
#include <nrf.h>
#include <nrf_power.h>
#include <nrf_gpio.h>

#define SERIAL_CDC
#define CFG_PRINTF_NRF

#define DISABLE_USB
#define LED_PIN        LED_BLUE         // Ajusta al pin de tu LED
#define REBOOT_TIME_S  1        // Tiempo en segundos antes de reset

Adafruit_FlashTransport_QSPI flashTransport;

// Prototipo para deshabilitar el SoftDevice
extern "C" uint32_t sd_softdevice_disable(void);

// Configura y arranca LFCLK (cristal) necesario para RTC
void lfclk_start() {
  NRF_CLOCK->LFCLKSRC           = CLOCK_LFCLKSRC_SRC_RC  << CLOCK_LFCLKSRC_SRC_Pos;
  NRF_CLOCK->EVENTS_LFCLKSTARTED = 0;
  NRF_CLOCK->TASKS_LFCLKSTART    = 1;
  while (!NRF_CLOCK->EVENTS_LFCLKSTARTED);
  nrf_gpio_cfg_default(0);  // P0.00 (XL1)
  nrf_gpio_cfg_default(1);  // P0.01 (XL2)
}

// ISR de RTC2: tras REBOOT_TIME_S segundos, resetea el sistema
extern "C" void RTC2_IRQHandler(void) {
  if (NRF_RTC2->EVENTS_COMPARE[0]) {
    NRF_RTC2->EVENTS_COMPARE[0] = 0;
    NVIC_SystemReset();
  }
}

void wdt_init() {
  // Arranca LFCLK (necesario para el WDT)
  NRF_CLOCK->LFCLKSRC = CLOCK_LFCLKSRC_SRC_RC  << CLOCK_LFCLKSRC_SRC_Pos;
  NRF_CLOCK->EVENTS_LFCLKSTARTED = 0;
  NRF_CLOCK->TASKS_LFCLKSTART = 1;
  while (!NRF_CLOCK->EVENTS_LFCLKSTARTED);

  // Desactiva comportamiento en SLEEP/HALT (opcional)
  NRF_WDT->CONFIG = 0;

  // CRV: tiempo en ticks de 32.768 kHz → 10 s = 10 * 32768 = 327680
  NRF_WDT->CRV = REBOOT_TIME_S * 32768UL;

  NRF_WDT->RREN = WDT_RREN_RR0_Msk;      // Habilita RR0
  NRF_WDT->TASKS_START = 1;              // Inicia el WDT
}


// Configura RTC2 para COMPARE[0] = REBOOT_TIME_S × 32768 ticks
void rtc2_init(uint32_t seconds) {
  lfclk_start();

  NRF_RTC2->PRESCALER = 1;                    // tick = 32768 Hz
  NRF_RTC2->CC[0]     = seconds * 32768UL;    // segundos × ticks/s
  NRF_RTC2->EVTENSET  = RTC_EVTENSET_COMPARE0_Msk;
  NRF_RTC2->INTENSET  = RTC_INTENSET_COMPARE0_Msk;
  NVIC_EnableIRQ(RTC2_IRQn);

  NRF_RTC2->TASKS_START = 1;
}

void disableGPIOs(uint8_t start, uint8_t end) {
  for (uint32_t i = start; i <= end; i++) {
    if (i == 0 || i == 1 || i == 26 || i == 30 || i == 6) continue;
    nrf_gpio_cfg_input(i, NRF_GPIO_PIN_PULLUP);
  }
}

void debug_clock_status() {
  Serial.begin(115200);
  while (!Serial) {
    delay(10);  // Espera hasta que se conecte por USB
  }

  // ---------------- CLOCK STATUS ----------------
  Serial.println("\n[Clock Status]");

  // High Frequency Clock
  Serial.print("HFCLK running: ");
  Serial.println((NRF_CLOCK->HFCLKSTAT & CLOCK_HFCLKSTAT_STATE_Msk) ? "YES" : "NO");

  Serial.print("HFCLK source: ");
  if (NRF_CLOCK->HFCLKSTAT & CLOCK_HFCLKSTAT_SRC_Msk)
    Serial.println("XTAL (cristal)");
  else
    Serial.println("RC");

  // Low Frequency Clock
  Serial.print("LFCLK running: ");
  Serial.println((NRF_CLOCK->LFCLKSTAT & CLOCK_LFCLKSTAT_STATE_Msk) ? "YES" : "NO");

  Serial.print("LFCLK source: ");
  switch ((NRF_CLOCK->LFCLKSTAT & CLOCK_LFCLKSTAT_SRC_Msk) >> CLOCK_LFCLKSTAT_SRC_Pos) {
    case 0: Serial.println("RC"); break;
    case 1: Serial.println("XTAL"); break;
    case 2: Serial.println("Synth"); break;
    default: Serial.println("Unknown"); break;
  }

  // ---------------- PERIPHERAL CHECK ----------------
  Serial.println("\n[Peripherals potentially active]");

  if (NRF_UART0->ENABLE)   Serial.println("UART0 enabled");
  if (NRF_UARTE0->ENABLE)  Serial.println("UARTE0 enabled");
  if (NRF_UARTE1->ENABLE)  Serial.println("UARTE1 enabled");
  if (NRF_SPIM0->ENABLE)   Serial.println("SPIM0 enabled");
  if (NRF_TWIM0->ENABLE)   Serial.println("TWIM0 enabled");
  if (NRF_TIMER0->TASKS_START) Serial.println("TIMER0 running");
  if (NRF_TIMER1->TASKS_START) Serial.println("TIMER1 running");
  if (NRF_TIMER2->TASKS_START) Serial.println("TIMER2 running");
  if (NRF_TIMER3->TASKS_START) Serial.println("TIMER3 running");
  if (NRF_TIMER4->TASKS_START) Serial.println("TIMER4 running");
  if (NRF_SAADC->ENABLE)   Serial.println("SAADC enabled");
  if (NRF_PWM0->ENABLE)    Serial.println("PWM0 enabled");
  if (NRF_RADIO->TASKS_DISABLE == 0) Serial.println("RADIO may be active");
  if (NRF_RNG->TASKS_START) Serial.println("RNG running");
  if (NRF_CRYPTOCELL->ENABLE) Serial.println("CRYPTOCELL enabled");
  if (NRF_USBD->ENABLE)    Serial.println("USBD enabled");
  if (NRF_TEMP->TASKS_START) Serial.println("TEMP running");

  // SoftDevice state (if applicable)
  uint8_t sd_is_enabled = 0;
  if (sd_softdevice_is_enabled(&sd_is_enabled) == 0 && sd_is_enabled) {
    Serial.println("SoftDevice: ENABLED");
  } else {
    Serial.println("SoftDevice: DISABLED");
  }
}

//SemaphoreHandle_t xSemaphore;

void setup() {
  //xSemaphore = xSemaphoreCreateBinary();
  


  // Señal de arranque
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  delay(100);
  digitalWrite(LED_PIN, HIGH);
  digitalWrite(LED_PIN, HIGH);


  //debug_clock_status();
  

  
  sd_softdevice_disable();
  
  SysTick->CTRL = 0;
  NRF_UICR->REGOUT0 = 0xFFFFFFFE;
  NRF_CLOCK->TASKS_HFCLKSTOP = 1;
  //while (NRF_CLOCK->EVENTS_HFCLKSTARTED == 0) { }
  NRF_PDM->ENABLE = 0;
  NRF_QDEC->ENABLE = 0;
  NRF_TWIM1->ENABLE = 0;
  NRF_SPIM1->ENABLE = 0;
  NRF_SPIM2->ENABLE = 0;
  NRF_SPIM3->ENABLE = 0;
  
  flashTransport.begin();
  flashTransport.runCommand(0xB9);  // comando Deep Power Down
  flashTransport.end();
  NRF_PWM1->ENABLE = 0;
  NRF_PWM2->ENABLE = 0;
  NRF_PWM3->ENABLE = 0;
  NRF_I2S->ENABLE = 0;
  
  NRF_MWU->INTENCLR = 0xFFFFFFFF;
  CoreDebug->DEMCR &= ~CoreDebug_DEMCR_TRCENA_Msk;
  NRF_CLOCK->TRACECONFIG = 0;
  SysTick->CTRL = 0;
  /*
  NRF_POWER->RAM[0].POWERCLR = 0xFFFFFFFF;
  */
  
  NRF_SPIM0->ENABLE = 0;
  NRF_SPIM1->ENABLE = 0;
  NRF_SPIM2->ENABLE = 0;
  NRF_SPIM3->ENABLE = 0;
  NRF_SPIS0->ENABLE = 0;
  NRF_SPIS1->ENABLE = 0;
  NRF_SPIS2->ENABLE = 0;
  NRF_SPI0->ENABLE = 0;
  NRF_SPI1->ENABLE = 0;
  NRF_SPI2->ENABLE = 0;

  
  NRF_TWIM0->ENABLE = 0;
  NRF_TWIM1->ENABLE = 0;
  NRF_TWIS0->ENABLE = 0;
  NRF_TWIS1->ENABLE = 0;
  NRF_TWI0->ENABLE = 0;
  NRF_TWI1->ENABLE = 0;

  NRF_SAADC->ENABLE = 0;
  NRF_TEMP->TASKS_STOP = 1;
  NRF_TEMP->EVENTS_DATARDY = 0;
  NRF_RNG->TASKS_STOP = 1;
  NRF_RNG->INTENCLR = 0xFFFFFFFF;


  // Apaga posibles bloques activos por arranque previo
  NRF_TEMP->TASKS_STOP = 1;
  NRF_TEMP->EVENTS_DATARDY = 0;

  NRF_SAADC->TASKS_STOP = 1;
  NRF_SAADC->ENABLE = 0;

  NRF_USBD->ENABLE = 0;
  NRF_USBD->USBPULLUP = 0;
  NRF_POWER->DCDCEN0 = 1;  // Core
  NRF_POWER->DCDCEN = 1;   // Peripherals
  NRF_GPIO->PIN_CNF[24] = 0;  // USB DM
  NRF_GPIO->PIN_CNF[25] = 0;
  NRF_UICR->REGOUT0 = 0xFFFFFFFE;
  NRF_CLOCK->EVENTS_HFCLKSTARTED = 0;
  NRF_POWER->USBREGSTATUS;  // leerlo antes
  NRF_POWER->EVENTS_USBPWRRDY = 0;

  NRF_NFCT->TASKS_DISABLE = 1;
  NRF_NFCT->INTENCLR = 0xFFFFFFFF;
  NRF_NFCT->EVENTS_FIELDDETECTED = 0;
  
  NRF_UARTE0->ENABLE = 0;
  NRF_UARTE1->ENABLE = 0;
  NRF_UARTE0->RXD.PTR = 0;
  NRF_UARTE1->RXD.PTR = 0;
  NRF_TWIM0->ENABLE = 0;
  NRF_SPIM0->ENABLE = 0;
  NRF_PWM0->ENABLE  = 0;
  NRF_RNG->TASKS_STOP = 1;
  NRF_RNG->INTENCLR = 0xFFFFFFFF;
  NRF_RADIO->TASKS_DISABLE = 1;
  NRF_CRYPTOCELL->ENABLE = 0;
  NRF_MWU->INTENCLR = 0xFFFFFFFF;

  NRF_TIMER1->TASKS_STOP = 1;
  NRF_TIMER1->MODE = TIMER_MODE_MODE_Timer;

  NRF_TIMER2->TASKS_STOP = 1;
  NRF_TIMER2->MODE = TIMER_MODE_MODE_Timer;

  NRF_TIMER3->TASKS_STOP = 1;
  NRF_TIMER3->MODE = TIMER_MODE_MODE_Timer;

  NRF_TIMER4->TASKS_STOP = 1;
  NRF_TIMER4->MODE = TIMER_MODE_MODE_Timer;

  NRF_RTC0->TASKS_STOP = 1;
  NRF_RTC1->TASKS_STOP = 1;
  
  // Apaga el LED antes de dormir
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  NRF_QSPI->ENABLE = QSPI_ENABLE_ENABLE_Disabled;
  NRF_PPI->CHEN = 0;

  

  for (int i = 0; i < 8; i++) {
    NRF_GPIOTE->CONFIG[i] = 0;
  }
  NRF_WDT->TASKS_START = 1;

  disableGPIOs(0, 30);

  for (uint32_t i = 32; i <= 47; i++) {
    if (i == 41 || i == 42) continue;  // SWDIO y SWDCLK (según configuración)
    nrf_gpio_cfg_input(i, NRF_GPIO_PIN_PULLUP);
  }

  // Inicializa RTC2 para el reset tras REBOOT_TIME_S
  rtc2_init(REBOOT_TIME_S);
  //NVIC_ClearPendingIRQ(RTC2_IRQn);
  //NVIC_EnableIRQ(RTC2_IRQn);
    // Inicializa WDT para reset tras REBOOT_TIME_S
  //wdt_init();
  
  pinMode(LED_BUILTIN, INPUT);  // Desactiva LED interno
  NRF_POWER->SYSTEMOFF = 0;     // Por si acaso
  //SCB->CPACR &= ~(0xF << 20);

  //NRF_POWER->RAM[0].POWERCLR = 0xFFFFFFFF;
  //NRF_POWER->RAM[1].POWERCLR = 0xFFFFFFFF;
  //NRF_POWER->RAM[2].POWERCLR = 0xFFFFFFFF;
  //NRF_POWER->RAM[3].POWERCLR = 0xFFFFFFFF;

  //NRF_POWER->SYSTEMOFF = 1;
  //xSemaphoreTake(xSemaphore, portMAX_DELAY);
  __SEV();   // Clear eventos pendientes
  __WFE();   // Espera primer evento (limpia)
  __WFE();   // Entra en sleep real
  
}

void loop() {
  __WFI();
}
