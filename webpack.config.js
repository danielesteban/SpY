const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const GHPagesSPAWebpackPlugin = require('ghpages-spa-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RobotstxtPlugin = require('robotstxt-webpack-plugin').default;
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const modulesPath = path.resolve(__dirname, 'node_modules');
const srcPath = path.resolve(__dirname, 'src');
const outputPath = path.resolve(__dirname, 'dist');
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const basename = process.env.BASENAME || '/';
const version = (() => {
  let version;
  if (fs.existsSync('.git')) {
    /* Get version from the repo commit count */
    let commitCount;
    try {
      commitCount = parseInt(childProcess.execSync('git rev-list HEAD --count').toString(), 10);
    } catch (e) {
      commitCount = 0;
    }
    version = `${Math.floor(commitCount / 1000)}.${Math.floor(commitCount / 100) % 10}.${commitCount % 100}`;
  } else {
    /* Failover to package.json version */
    try {
      // eslint-disable-next-line prefer-destructuring
      version = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'))).version;
    } catch (e) {
      version = '0.0.0';
    }
  }
  return `v${version}`;
})();


module.exports = {
  mode,
  entry: [
    path.join(srcPath, 'index.sass'),
    path.join(srcPath, 'index.js'),
  ],
  output: {
    filename: `code/${(mode === 'production' ? '[name].[contenthash]' : '[name]')}.js`,
    globalObject: 'this',
    path: outputPath,
    publicPath: basename,
  },
  resolve: {
    alias: { '@': srcPath },
  },
  module: {
    rules: [
      ...(mode === 'development' ? [
        {
          test: /\.(js|jsx)$/,
          enforce: 'pre',
          loader: 'eslint-loader',
          options: {
            emitWarning: true,
          },
          include: srcPath,
          exclude: modulesPath,
        },
      ] : []),
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { modules: false }],
          ],
        },
        include: srcPath,
        exclude: modulesPath,
      },
      {
        test: /\.sass/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer({ browsers: ['last 2 versions'] })],
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'compressed',
              sourceMap: true,
            },
          },
        ],
        include: srcPath,
        exclude: modulesPath,
      },
      {
        test: /\.(bin|gif|jpg|png|svg|ttf|woff|woff2|mp3|ogg)$/,
        loader: 'file-loader',
        options: {
          name: `assets/${(mode === 'production' ? '[hash]' : '[name]')}.[ext]`,
        },
        include: srcPath,
        exclude: modulesPath,
      },
    ],
  },
  devtool: false,
  devServer: {
    hot: true,
    stats: 'minimal',
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  performance: { hints: false },
  stats: { children: false, entrypoints: false, modules: false },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
      },
      __BASENAME__: JSON.stringify(basename),
      __PRODUCTION__: JSON.stringify(mode === 'production'),
    }),
    new HtmlWebpackPlugin({
      csp: (
        `default-src 'self'${mode !== 'production' ? " ws: 'unsafe-eval'" : ''};`
      ),
      minify: { collapseWhitespace: true },
      template: path.join(srcPath, 'index.ejs'),
      title: 'SpY',
      version,
    }),
    new MiniCssExtractPlugin({
      filename: 'code/[name].[contenthash].css',
    }),
    ...(mode === 'production' ? [
      new CleanWebpackPlugin(['dist']),
      new webpack.HashedModuleIdsPlugin(),
      new RobotstxtPlugin({
        policy: [{
          userAgent: '*',
          disallow: '/',
        }],
      }),
      new GHPagesSPAWebpackPlugin({
        domain: 'spygame.tk',
      }),
      new webpack.SourceMapDevToolPlugin({
        test: /\.js$/,
        filename: 'code/[name].[contenthash].js.map',
        exclude: /(manifest|vendor)/,
      }),
      ...(process.env.npm_config_report ? ([
        new BundleAnalyzerPlugin(),
      ]) : []),
    ] : [
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.EvalSourceMapDevToolPlugin({
        moduleFilenameTemplate: info => (
          `file:///${info.absoluteResourcePath}`
        ),
      }),
    ]),
  ],
};
