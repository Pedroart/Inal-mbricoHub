cd node_modules/electron/dist
sudo chown root:root chrome-sandbox
sudo chmod 4755 chrome-sandbox

es porque Chromium requiere que chrome-sandbox tenga permisos SUID root (4755).
En Windows/Mac esto no es un problema, pero en Linux sí necesitas configurarlo.