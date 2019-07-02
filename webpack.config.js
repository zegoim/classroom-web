const path = require('path')
const webpack = require('webpack')
const ManifestPlugin = require('webpack-manifest-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const WebpackBuildDllPlugin = require('webpack-build-dll-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const __DEV__ = process.env.NODE_ENV !== 'production'
const {
  outputPath,
  publicPath,
  hostName,
  port,
  toElectron,
  webpackManifestName
} = require('./config')

const rootPath = path.resolve('src')
const hash = 0 ? '' : '.[hash:base64:5]'
const normalUrlLoader = __DEV__ ? 'file?' : 'url?limit=2048&'

module.exports = {
  devtool: __DEV__ ? 'cheap-module-eval-source-map' : void 0,
  entry: {
    app: [
      'babel-polyfill',
      ...(__DEV__ ? [
        'react-hot-loader/patch',
        `webpack-hot-middleware/client?path=http://${hostName}:${port}/__webpack_hmr&hot=true&reload=false`,
        'webpack/hot/only-dev-server'
      ] : []),
      './src/index.tsx'
    ]
  },
  output: {
    path: path.resolve(`${outputPath}/${publicPath}/`),
    publicPath: __DEV__ ? `http://${hostName}:${port}/${publicPath}/` : `${toElectron? '.' :''}/${publicPath}/`,
    filename: `js/[name]${__DEV__ ? '' : '.[hash:5]'}.js`,
    chunkFilename: 'js/[name].[chunkhash:5].js'
  },
  resolve: {
    extensions: ['.webpack.js', '.js', '.jsx', '.ts', '.tsx'],
    modules: ['./node_modules', './src'],
    alias: {
      'video.js': path.resolve(__dirname, './node_modules/video.js/dist/video.min.js'),
      '@root': path.resolve(__dirname, './src')
    }
  },
  resolveLoader: {
    moduleExtensions: ['-loader']
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      loader: `babel${__DEV__ ? `?cacheDirectory=${outputPath}/babelCacheDev` : ''}`,
      exclude: [/(node_modules|bower_components)/]
    }, {
      test: /\.tsx?$/,
      use: {
        loader: 'awesome-typescript',
        query: {
          configFileName: path.resolve(__dirname, './tsconfig.json'),
          useBabel: __DEV__,
          useCache: __DEV__,
          useTranspileModule: __DEV__,
          forkChecker: __DEV__,
          cacheDirectory: __DEV__ ? `${outputPath}/awesomeTypescriptCacheDev` : void 0
        }
      }
    }, {
      test:  /\.(sa|sc|c)ss$/,
      use: ['style', 'css', {
        loader: 'less',
        options: {
          javascriptEnabled: true
        }
      }]
    }, {
      test: /\.(jpe?g|png|gif|bmp)$/i,
      loader: `${normalUrlLoader}name=images/[name]${hash}.[ext]`
    }, {
      test: /\.svg$/,
      loader: `${normalUrlLoader}name=images/[name]${hash}.[ext]`
    }, {
      test: /\.(woff(2)?|ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: `${normalUrlLoader}name=fonts/[name]${hash}.[ext]`
    }, {
      test: /\.node$/,
      use: 'node-loader'
    }]
  },
  plugins: [
    new WebpackBuildDllPlugin({
      dllConfigPath: './webpack.dll.config.js'
    }),
    new WebpackMd5Hash(),
    new ManifestPlugin({ fileName: `${webpackManifestName}.json` }),
    new webpack.DefinePlugin({
      __DEV__,
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.DllReferencePlugin({
      context: `./${outputPath}`,
      manifest: require(`./${outputPath}/${publicPath}/webpack-vendor-manifest${__DEV__ ? '.dev' : '.prod'}.json`)
    })
  ].concat(__DEV__ ? [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ] : [
    // new BundleAnalyzerPlugin()
  ])
}
