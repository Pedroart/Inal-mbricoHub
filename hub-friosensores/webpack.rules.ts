import type { ModuleOptions } from 'webpack';

export const rules: Required<ModuleOptions>['rules'] = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@timfish/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  /*
  {
    test: /\.module\.css$/i,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          module: true,
          importLoaders: 1
        }
      },
      'postcss-loader'
    ]
  },*/
  {
    test: /\.css$/,
    exclude: /\.module\.css$/i,
    use: ['style-loader', 'css-loader','postcss-loader'],
  },
  {
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: 'asset/resource',
  }
];
