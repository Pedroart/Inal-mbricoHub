import type { Configuration } from 'webpack';
import * as path from "path";



import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';


export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // 👈 esto habilita `@` como alias a tu carpeta src/
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
