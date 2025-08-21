# 0) (Opcional) Ver qué versión de Electron usa tu proyecto
node -p "require('electron/package.json').version" 2>/dev/null || echo "Electron no en node_modules"

# 1) Instala toolchain (Ubuntu/Debian) por si falta compilar nativos
sudo apt-get update
sudo apt-get install -y build-essential python3 make g++ libbluetooth-dev

# 2) Limpia instalación
rm -rf node_modules package-lock.json
npm ci

# 3) Recompila dependencias nativas para Electron
#    (A) vía electron-builder (si está en devDependencies en este boilerplate)
npx electron-builder install-app-deps

#    (B) o con electron-rebuild apuntando al módulo problemático
npx @electron/rebuild -f -w @abandonware/bluetooth-hci-socket

# 4) Alternativa directa con npm rebuild apuntando al runtime Electron
ELECTRON_VER=$(node -p "require('electron/package.json').version")
npm rebuild @abandonware/bluetooth-hci-socket \
  --build-from-source \
  --runtime=electron \
  --target="$ELECTRON_VER" \
  --disturl=https://electronjs.org/headers

# 5) Ejecuta de nuevo
npm start
