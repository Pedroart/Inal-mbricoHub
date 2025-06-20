## Si no deja instar paquetes

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

```bash
npx electron-rebuild
```