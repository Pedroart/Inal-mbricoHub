import path from 'path';

import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import 'copy-webpack-plugin';

import CopyWebpackPlugin from 'copy-webpack-plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'static/layoud', // 👈 Usa ruta relativa
        to: 'layoud',
        noErrorOnMissing: true,
      },
    ],
  }),
];
