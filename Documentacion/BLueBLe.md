✅ Cómo resolverlo: instalar el firmware manualmente
📥 Paso 1: Instalar el paquete firmware‑realtek (si aún no lo tienes)

sudo apt update
sudo apt install firmware-realtek

Este paquete incluye rtl8761bu_fw.bin y rtl8761bu_config.bin en versiones recientes de Debian/Bookworm
linuxreviews.org+3packages.debian.org+3dietpi.com+3

Si tu versión del paquete no incluye esos archivos, continúa con los pasos alternativos.
🧩 Paso 2: Descargar manualmente el firmware desde el repositorio oficial

cd /tmp
wget https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git/plain/rtl_bt/rtl8761bu_fw.bin
wget https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git/plain/rtl_bt/rtl8761bu_config.bin

📂 Paso 3: Copiarlos a la carpeta correcta

sudo mv rtl8761bu_fw.bin /lib/firmware/rtl_bt/
sudo mv rtl8761bu_config.bin /lib/firmware/rtl_bt/

🔄 Paso 4: Recargar el módulo y reiniciar Bluetooth

sudo rmmod btusb
sudo modprobe btusb
sudo systemctl restart bluetooth

También puedes reiniciar el sistema.
🔧 Resultados esperados

Después de estos pasos:

hciconfig

Debería mostrar hci0 con una dirección MAC válida (no ceros) y estado UP RUNNING, indicando que el dongle ahora funciona correctamente. Si ves eso y Bluetooth funciona, ya puedes usarlo como adaptador principal.




✅ Script de arranque ajustado: activar solo hci0, desactivar hci1
🔧 Paso 1: Crear el script /usr/local/bin/bluetooth-init.sh

nano /usr/local/bin/bluetooth-init.sh

Contenido actualizado:

#!/bin/bash

# Desbloquea todos los adaptadores Bluetooth
rfkill unblock all

# Espera a que los dispositivos se registren
sleep 1

# Apagar Bluetooth interno (hci1)
hciconfig hci1 down

# Encender dongle USB (hci0)
hciconfig hci0 up

# Encender desde bluetoothctl (necesario para bleak u otros)
echo -e "select hci0\npower on\nquit" | bluetoothctl

Guarda y dale permisos:

chmod +x /usr/local/bin/bluetooth-init.sh

⚙️ Paso 2: Crear servicio systemd

nano /etc/systemd/system/bluetooth-init.service

Contenido:

[Unit]
Description=Desbloquear y activar dongle Bluetooth (hci0)
After=bluetooth.service
Requires=bluetooth.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/bluetooth-init.sh

[Install]
WantedBy=multi-user.target

🧪 Paso 3: Habilitar y ejecutar

systemctl daemon-reload
systemctl enable bluetooth-init.service
systemctl start bluetooth-init.service

✅ Verificación

Después del reinicio o ejecución:

hciconfig

Deberías ver:

    hci0 → UP RUNNING

    hci1 → DOWN

Y en bluetoothctl:

bluetoothctl
show

Debe decir Powered: yes para hci0.