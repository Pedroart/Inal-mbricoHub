import { readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

async function convertirIndexTsAJson() {
  const basePath = path.resolve(__dirname, '../buildResources/mapas');
  const carpetas = readdirSync(basePath).filter((nombre) => {
    const ruta = path.join(basePath, nombre);
    return statSync(ruta).isDirectory();
  });

  for (const carpeta of carpetas) {
    const indexPath = path.join(basePath, carpeta, 'index.ts');

    if (!existsSync(indexPath)) {
      console.warn(`⚠️ No se encontró index.ts en ${carpeta}`);
      continue;
    }

    try {
      const modulo = await import(pathToFileURL(indexPath).href);
      const mapa = modulo.default;

      if (!mapa) {
        console.warn(`⚠️ El archivo ${carpeta}/index.ts no exporta 'default'`);
        continue;
      }

      const outPath = path.join(basePath, carpeta, 'index.json');
      writeFileSync(outPath, JSON.stringify(mapa, null, 2));
      console.log(`✅ Generado: ${carpeta}/index.json`);
    } catch (err) {
      console.error(`❌ Error al procesar ${carpeta}:`, err);
    }
  }
}

convertirIndexTsAJson();
