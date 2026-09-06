const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env = {}) => {
  // production by default; opt out with --env mode=development
  const isProduction = env.mode !== 'development';
  const isExample = env.output === 'example';

  const outputPath = isExample
    ? path.resolve(__dirname, 'examples/js')
    : path.resolve(__dirname, 'dist');

  const filename = isProduction
    ? 'senangstart-xr.min.js'
    : 'senangstart-xr.js';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: './src/index.js',
    output: {
      path: outputPath,
      filename,
    },
    devtool: isProduction ? 'hidden-source-map' : 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        },
      ],
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: { comments: false },
          },
          extractComments: false,
        }),
      ],
    },
    devServer: {
      static: path.resolve(__dirname, 'examples'),
      port: 8080,
      open: false,
    },
    plugins: [],
  };
};
