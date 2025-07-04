import path from 'path';
import fs from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertirIndexTsAJson() {
  const basePath = path.resolve(__dirname, '../../buildResources/mapas');
  const carpetas = fs.readdirSync(basePath).filter((nombre) => {
    const ruta = path.join(basePath, nombre);
    return fs.statSync(ruta).isDirectory();
  });

  for (const carpeta of carpetas) {
    const indexPath = path.join(basePath, carpeta, 'index.ts');

    if (!fs.existsSync(indexPath)) {
      console.warn(`⚠️ No se encontró index.ts en ${carpeta}`);
      continue;
    }

    try {
      const modulo = await import(pathToFileURL(indexPath).href);
      const mapa = modulo.default;
      const outPath = path.join(basePath, carpeta, 'index.json');
      fs.writeFileSync(outPath, JSON.stringify(mapa, null, 2));
      console.log(`✅ Generado: ${carpeta}/index.json`);
    } catch (err) {
      console.error(`❌ Error al procesar ${carpeta}:`, err);
    }
  }
}

convertirIndexTsAJson();
