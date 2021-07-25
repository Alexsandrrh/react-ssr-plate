require('dotenv')
const path = require('path')
const setEnvs = require('./setEnvs')
const { DefinePlugin, HotModuleReplacementPlugin } = require('webpack')
const WebpackBar = require('webpackbar')
const CopyPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const LoadablePlugin = require('@loadable/webpack-plugin')
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin')
const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

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
 * @param {("development"|"production" | "test")} env
 * @return {Object}
 * */
async function createAsyncConfig(target, nodeEnv) {
  // Set envs
  const { isServer, isDev, isProd, isClient, clientPublicPath } = setEnvs(
    target,
    nodeEnv
  )

  const config = {
    mode: nodeEnv,
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
        },
        {
          test: /\.svg$/,
          use: ['svg-sprite-loader', 'svgo-loader']
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
          'process.env.NODE_ENV': nodeEnv,
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
        writeToDisk: true
      })
    ]

    if (isDev) {
      // Output
      config.output = {
        ...config.output,
        filename: 'assets/js/[name].js',
        chunkFilename: 'assets/js/[name].chunk.js'
      }

      // Rules
      config.module.rules = [
        ...config.module.rules,
        {
          test: /\.css$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName: '[name]__[local]__[hash:base64:6]'
                },
                importLoaders: 1,
                sourceMap: true
              }
            }
          ]
        }
      ]

      // Dev Server
      config.devServer = {
        stats: 'errors-only',
        disableHostCheck: true,
        clientLogLevel: 'none',
        compress: true,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        historyApiFallback: {
          disableDotRule: true
        },
        publicPath: clientPublicPath,
        hot: true,
        host: process.env.DEV_HOST,
        port: process.env.DEV_PORT,
        watchOptions: { ignored: /node_modules/ },
        before(app) {
          app.use(errorOverlayMiddleware())
        }
      }

      // Plugins
      config.plugins = [
        ...config.plugins,
        new HotModuleReplacementPlugin({
          multiStep: true
        })
      ]
    }

    if (isProd) {
      // Output
      config.output = {
        ...config.output,
        filename: 'assets/js/[name].[contenthash].js',
        chunkFilename: 'assets/js/[name].[contenthash].chunk.js'
      }

      // Rules
      config.module.rules = [
        ...config.module.rules,
        {
          test: /\.css$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName: '[hash:base64:6]'
                },
                importLoaders: 1,
                sourceMap: true
              }
            }
          ]
        }
      ]

      // Plugins
      config.plugins = [
        ...config.plugins,
        new MiniCssExtractPlugin({
          filename: 'assets/css/[name].[contenthash].css',
          chunkFilename: 'assets/css/[id].[contenthash].css'
        })
      ]
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

    if (isProd) {
      config.module.rules = [
        ...config.module.rules,
        {
          test: /\.css$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  exportOnlyLocals: true,
                  localIdentName: '[hash:base64:6]'
                },
                importLoaders: 1
              }
            }
          ]
        }
      ]
    }

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

      config.module.rules = [
        ...config.module.rules,
        {
          test: /\.css$/,
          exclude: /(node_modules|bower_components)/,
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  exportOnlyLocals: true,
                  localIdentName: '[name]__[local]__[hash:base64:6]'
                },
                importLoaders: 1
              }
            }
          ]
        }
      ]

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
