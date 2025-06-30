import { readdirSync, statSync, writeFileSync } from 'fs';
import path from 'path';

async function convertirIndexTsAJson() {
  const basePath = path.resolve(__dirname, '../static/layoud');
  const carpetas = readdirSync(basePath).filter((nombre) => {
    const ruta = path.join(basePath, nombre);
    return statSync(ruta).isDirectory();
  });

  for (const carpeta of carpetas) {
    const indexPath = path.join(basePath, carpeta, 'index.ts');
    const existe = statSync(indexPath).isFile();

    if (!existe) {
      console.warn(`No se encontró index.ts en ${carpeta}`);
      continue;
    }

    try {
      const modulo = await import(indexPath);
      const mapa = modulo.default;
      const outPath = path.join(basePath, carpeta, 'index.json');
      writeFileSync(outPath, JSON.stringify(mapa, null, 2));
      console.log(`✅ Generado: ${carpeta}/index.json`);
    } catch (err) {
      console.error(`❌ Error al procesar ${carpeta}:`, err);
    }
  }
}

convertirIndexTsAJson();
