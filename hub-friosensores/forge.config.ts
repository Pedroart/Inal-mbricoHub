import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

import { resolve, join, dirname } from "path";
import { copy, mkdirs } from "fs-extra";
import nodeExternals from 'webpack-node-externals';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: ['static/layoud'],
  },
  hooks: {
    async packageAfterCopy(_forgeConfig, buildPath) {

      const requiredNativePackages = [
        "@abandonware/noble",
        "@abandonware/bluetooth-hci-socket",
        "debug",
        "ms",
        "better-sqlite3",
        "bindings",
        "file-uri-to-path",
        "electron-store",
        "conf",
        "dot-prop",
        "is-obj"
      ];


      const sourceNodeModulesPath = resolve(".", "node_modules");
      const destNodeModulesPath = resolve(buildPath, "node_modules");

      await Promise.all(
        requiredNativePackages.map(async (packageName) => {
          const sourcePath = join(sourceNodeModulesPath, packageName);
          const destPath = join(destNodeModulesPath, packageName);

          await mkdirs(dirname(destPath));
          await copy(sourcePath, destPath, {
            recursive: true,
            preserveTimestamps: true
          });
        })
      );
    }
  },

  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerDeb({})],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/renderer/index.html',
            js: './src/renderer/index.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new AutoUnpackNativesPlugin({}),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
