require('dotenv')
const path = require('path')
const { DefinePlugin } = require('webpack')
const WebpackBar = require('webpackbar')
const CopyPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const LoadablePlugin = require('@loadable/webpack-plugin')

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
 * @name createWebpackConfig
 * @param {("client" | "server")} target
 * @param {("development"|"production")} env
 * @return {Object}
 * */
async function createWebpackConfig(target, env) {
  const isClient = target === 'client'
  const isServer = target === 'server'
  const isDev = env === 'development'
  const isProd = env === 'production'

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
    config.entry = { bundle: [paths.clientEntry] }
    config.output = {
      path: paths.publicBuildDir,
      filename: 'assets/js/[name].js',
      chunkFilename: 'assets/js/[name].chunk.js'
    }

    config.plugins.push(
      new LoadablePlugin({
        filename: '../loadable-stats.json',
        outputAsset: path.resolve('dist'),
        writeToDisk: true,
        chunkLoadingGlobal: '__CHUNKS_GLOBAL__'
      })
    )

    if (isProd) {
      config.output = {
        ...config.output,
        filename: 'assets/js/[name].[contenthash].js',
        chunkFilename: 'assets/js/[name].[contenthash].chunk.js',
        publicPath: '/'
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
      filename: '[name].js',
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
  }

  return config
}

module.exports = createWebpackConfig
