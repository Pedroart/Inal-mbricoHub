# Instalar dependencias
sudo apt update
sudo apt install -y curl git build-essential python3

# Instalar NVM (última versión estable)
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recargar bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar NODE 23

nvm install 23
nvm use 23
nvm alias default 23


# Inicio del proyecto

npm run init