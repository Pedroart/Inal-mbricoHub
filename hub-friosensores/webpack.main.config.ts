
import type { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import nodeExternals from 'webpack-node-externals';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main/main.ts',
  // Put your normal webpack config below here
  externals: [        "@abandonware/noble",
        "@abandonware/bluetooth-hci-socket",
        "debug",
        "ms",
        "better-sqlite3",
        "bindings",
        "file-uri-to-path",
        //"electron-store",
        "conf",
        "dot-prop",
        "is-obj"],
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },

};
