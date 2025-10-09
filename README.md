# HMI SensorDesk


> **Estado:** WIP

> **Stack principal:** Electron + Vite + React + TypeScript + Python

## 1) Visión técnica

**HMI SensorDesk** es una aplicación de escritorio (Electron) enfocada en **monitoreo y visualizacion** industrial, diseñada para operar en **arquitecturas ARM** (como Raspberry Pi y sistemas embebidos industriales) y entornos de refrigeración o túneles de frío.

Su propósito es integrar sensores inalámbricos y cableados dentro de los túneles de refrigeración, permitiendo el monitoreo en tiempo real de variables críticas como temperatura, humedad o estado del sistema.

- **Adquisición**: BLE (beacons nRF52/ESP32), Modbus/TCP (PLC/sensores industriales) y, posteriormente, LoRa para monitoreo remoto en túneles.

- **Configuración**: archivos profile JSON persistentes con definición de sensores, layout de visualizacion y publicacion de data.

- **Almacenamiento**: persistencia local mediante MariaDB con soporte para cloud para respaldar la informacion.

- **UI**: React + Tailwind + shadcn/ui, con dashboards industriales (tarjetas, mapas con overlays, tablas dinámicas, alarmas visuales).


- **Extensibilidad**: integración futura de módulos Python (para BLE, LoRa o gateways externos).

Arquitectura en 3 capas TS: main (backend Electron), preload (IPC seguro) y renderer (UI) + Agentes(BLE, SERIAL).
Los agentes Python complementan el sistema como microservicios de adquisición en hardware ARM.

## 2) Enfoque técnico

Integración multiplataforma ARM/x64 optimizada para dispositivos de campo (Raspberry Pi, NanoPi, Jetson).

## 3) Requisitos

- **Linux ARMv7/ARM64/Debian x64** (objetivo principal: Raspberry Pi OS / Debian).

## 4) Modos de Ejecucion

El sistema puede ejecutarse en 2 modalidades:

- Modo Operador: Es el modo utilizado en los entornos de planta o dentro de los túneles de refrigeración, instalándose generalmente sobre hardware ARM como Raspberry Pi o NanoPi. Durante su funcionamiento, permite monitorear variables, activar alarmas, registrar eventos y analizar tendencias históricas.
- Modo Simulador: Esta modalidad se utiliza para diseñar y validar la configuración antes del despliegue en campo. A través de ella, el usuario puede crear o modificar el archivo de configuración con los mapeos Modbus, BLE y la disposición de los widgets del dashboard, comprobando visualmente cómo respondería el sistema real.


## 5) Estructura del proyecto

El proyecto **HMI SensorDesk** se organiza en tres grandes componentes: **Firmware**, **Software** y **Agentes**, cada uno con un propósito definido dentro del ecosistema completo de monitoreo y simulación.

```
├─ Firmware/        # Código y documentación de los sensores físicos
│ ├─ BLE-TEMP/      # Firmware para sensores BLE de temperatura (nRF52 / ESP32)
│ └─ docs/          # Esquemáticos, diagramas y documentación técnica
│
├─ Software/        # Aplicación principal HMI (Electron + React + Vite)
│ ├─ package/       # Paquete principal con las tres capas de ejecución
│ │ ├─ main/        # Proceso principal (TS) — inicializa DB, agentes y ventanas
│ │ ├─ preload/     # Puente IPC seguro (contextBridge)
│ │ └─ renderer/    # Interfaz (React + Tailwind + shadcn/ui)
│ └─ scripts/       # Scripts CLI, postinstalación y herramientas auxiliares
│
└─ Agentes/             # Módulos externos para adquisición y simulación
    ├─ BLE-Agent/       # Agente Python (Bleak) para escaneo BLE en ARM
    ├─ SERIAL-Agent/    # Agente para comunicación Modbus/RTU o UART
    ├─ SIM-Agent/       # Emulador de sensores para modo simulador
    ├─ LORA-Agent/      # (Futuro) Gateway LoRa → DB / WebSocket
    └─ README.md        # Guía de integración de agentes
```

### Descripción de carpetas

- **Firmware/** contiene el código embebido y la documentación de los sensores que comunican con el HMI. Aquí se almacenan los proyectos de **nRF52**, **ESP32** o cualquier otro hardware que se integre.  
- **Software/** agrupa toda la aplicación de escritorio, incluyendo la lógica principal, la interfaz de usuario, la base de datos y el empaquetado final.  
- **Agentes/** incluye los módulos externos que complementan el **modo Operador** (lectura real) y el **modo Simulador** (datos emulados). Estos agentes pueden ejecutarse como servicios independientes en nodos ARM o PC locales.  
