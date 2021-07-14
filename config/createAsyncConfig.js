require('dotenv')
const path = require('path')
const { DefinePlugin, HotModuleReplacementPlugin } = require('webpack')
const WebpackBar = require('webpackbar')
const CopyPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const LoadablePlugin = require('@loadable/webpack-plugin')
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin')

const paths = {
  buildDir: path.resolve('dist'),
  publicBuildDir: path.resolve('dist', 'public'),
  clientEntry: path.resolve('src', 'client'),
  serverEntry: path.resolve('src', 'server')
}

/**
 * @name createDefines
 * @param {Object} base
 * @return {Object}
 * */
function createDefines(base) {
  let output = {}
  const { env } = process

  for (const key of Object.keys(env)) {
    output[`process.env.${key}`] = env[key]
  }

  output = { ...output, ...base }

  for (const item of Object.keys(output)) {
    output[item] = JSON.stringify(output[item])
  }

  return output
}

/**
 *
 * @name createAsyncConfig
 * @param {("client" | "server")} target
 * @param {("development"|"production")} env
 * @return {Object}
 * */
async function createAsyncConfig(target, env) {
  const isClient = target === 'client'
  const isServer = target === 'server'
  const isDev = env === 'development'
  const isProd = env === 'production'
  const clientPublicPath = isDev ? process.env.PUBLIC_PATH : '/'

  const config = {
    mode: env,
    name: target,
    stats: 'errors-only',
    target: isServer ? 'node' : 'web',
    resolve: {
      extensions: ['.mjs', '.js', '.json', '.jsx', '.ts', '.tsx']
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader'
        }
      ]
    },
    plugins: [
      new WebpackBar({
        name: target
      }),
      new DefinePlugin(
        createDefines({
          'process.env.PUBLIC_DIR': paths.publicBuildDir,
          'process.env.NODE_ENV': env,
          IS_DEV: isDev,
          IS_PROD: isProd,
          IS_SERVER: isServer,
          IS_CLIENT: isClient
        })
      )
    ]
  }

  if (isClient) {
    // Client entry
    config.entry = { bundle: [paths.clientEntry] }

    // Common client output
    config.output = {
      path: paths.publicBuildDir,
      publicPath: clientPublicPath
    }

    // Common client plugins
    config.plugins = [
      ...config.plugins,
      new LoadablePlugin({
        filename: '../loadable-stats.json',
        outputAsset: path.resolve('dist'),
        writeToDisk: true,
        chunkLoadingGlobal: '__CHUNKS_GLOBAL__'
      })
    ]

    if (isDev) {
      // Output
      config.output = {
        ...config.output,
        filename: 'assets/js/[name].js',
        chunkFilename: 'assets/js/[name].chunk.js'
      }

      // Dev Server
      config.devServer = {
        disableHostCheck: true,
        clientLogLevel: 'none', // Enable gzip compression of generated files.
        compress: true, // watchContentBase: true,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        historyApiFallback: {
          // Paths with dots should still use the history fallback.
          // See https://github.com/facebookincubator/create-react-app/issues/387.
          disableDotRule: true
        },
        publicPath: clientPublicPath,
        hot: true,
        host: process.env.DEV_HOST,
        port: process.env.DEV_PORT,
        noInfo: true,
        overlay: false,
        quiet: true, // By default files from `contentBase` will not trigger a page reload.
        // Reportedly, this avoids CPU overload on some systems.
        // https://github.com/facebookincubator/create-react-app/issues/293
        watchOptions: { ignored: /node_modules/ }
      }

      config.plugins = [
        ...config.plugins,
        new HotModuleReplacementPlugin({
          multiStep: true
        })
      ]
    }

    if (isProd) {
      config.output = {
        ...config.output,
        filename: 'assets/js/[name].[contenthash].js',
        chunkFilename: 'assets/js/[name].[contenthash].chunk.js'
      }
    }
  }

  // Server
  if (isServer) {
    config.node = {
      __dirname: false,
      __filename: false
    }
    config.entry = [paths.serverEntry]
    config.output = {
      path: paths.buildDir,
      filename: 'server.js',
      chunkFilename: '[name].chunk.js',
      library: 'commonjs2'
    }
    config.externals = nodeExternals({
      allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i, 'webpack/hot/poll?300']
    })

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.resolve('public'),
            to: path.resolve('dist', 'public')
          }
        ]
      })
    )

    if (isDev) {
      // Entry
      config.entry = ['webpack/hot/poll?300', ...config.entry]

      config.watch = true

      config.plugins = [
        ...config.plugins,
        new HotModuleReplacementPlugin(),
        new RunScriptWebpackPlugin({
          name: 'server.js',
          nodeArgs: ['--inspect']
        })
      ]
    }
  }

  return config
}

module.exports = createAsyncConfig
