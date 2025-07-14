
# Habilitar BLE en Electron con `@abandonware/noble` (Linux)

Este documento explica cómo habilitar correctamente el escaneo de dispositivos Bluetooth Low Energy (BLE) en una aplicación Electron usando `@abandonware/noble`, especialmente en sistemas Linux y dispositivos ARM como Raspberry Pi u Orange Pi.

---

## ✅ Requisitos del sistema

Asegúrate de tener instaladas las siguientes dependencias:

```bash
sudo apt update
sudo apt install -y libbluetooth-dev libudev-dev build-essential python3
```

---

## ✅ Instalación de noble

```bash
npm install @abandonware/noble
```

> Asegúrate de que esté en `"dependencies"` y no en `"devDependencies"`.

---

## ⚠️ Permisos necesarios para BLE

El escaneo BLE con `noble` requiere acceso al socket `HCI` del sistema, lo que implica privilegios especiales. No uses `sudo` para ejecutar tu app Electron. En su lugar, otorga permisos directamente al binario de Electron.

---

## 🔧 Aplicar permisos al binario de Electron

Ubica el binario de Electron dentro del proyecto:

```
node_modules/electron/dist/electron
```

Otorga el permiso `cap_net_raw` con:

```bash
sudo setcap cap_net_raw+eip $(pwd)/node_modules/electron/dist/electron
```

Verifica que el permiso fue aplicado correctamente:

```bash
getcap node_modules/electron/dist/electron
```

Debe mostrar:

```
/ruta/al/proyecto/node_modules/electron/dist/electron = cap_net_raw+eip
```

---

## 👥 Agrega tu usuario al grupo `bluetooth`

```bash
sudo usermod -aG bluetooth $USER
```

Luego **reinicia la sesión** o el sistema.

---

## 🚀 Ejecutar la aplicación

Con los permisos configurados, ahora puedes ejecutar tu aplicación normalmente:

```bash
npx electron .
```

El módulo `@abandonware/noble` podrá escanear dispositivos BLE sin errores.

---

## 🛠️ Integración con electron-builder (.deb)

Si estás empaquetando tu aplicación con `electron-builder`, puedes automatizar la asignación de permisos al instalar el `.deb`.

### 1. Crea un script `scripts/postinstall.sh`:

```bash
#!/bin/bash
setcap cap_net_raw+eip /opt/TuApp/TuApp
```

> Reemplaza `TuApp` con el nombre real de tu binario.

Hazlo ejecutable:

```bash
chmod +x scripts/postinstall.sh
```

### 2. Agrega esto en tu `package.json`:

```json
"build": {
  "linux": {
    "target": "deb",
    "deb": {
      "afterInstall": "scripts/postinstall.sh",
      "depends": ["libbluetooth-dev", "libudev1"]
    }
  }
}
```

---

## ✅ Conclusión

Con estos pasos, tu aplicación Electron podrá acceder al adaptador BLE sin requerir `sudo`, incluso cuando uses `@abandonware/noble` en Linux o plataformas ARM.

---
