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
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const TerserPlugin = require('terser-webpack-plugin')
const NodemonPlugin = require('nodemon-webpack-plugin')

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

  const localIdentName = isDev
    ? '[name]__[local]__[hash:base64:6]'
    : '[hash:base64:6]'

  const config = {
    mode: nodeEnv,
    name: target,
    target: isServer ? 'node' : 'web',
    devtool: isDev ? 'eval-cheap-source-map' : 'source-map',
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

    config.optimization = {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all'
          }
        }
      }
    }

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
        }),
        new BundleAnalyzerPlugin({
          openAnalyzer: false
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

      // Optimize
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          new CssMinimizerPlugin(),
          new TerserPlugin({
            terserOptions: {
              parse: {
                // we want uglify-js to parse ecma 8 code. However, we don't want it
                // to apply any minification steps that turns valid ecma 5 code
                // into invalid ecma 5 code. This is why the 'compress' and 'output'
                // sections only apply transformations that are ecma 5 safe
                // https://github.com/facebook/create-react-app/pull/4234
                ecma: 8
              },
              compress: {
                ecma: 5,
                warnings: false,
                // Disabled because of an issue with Uglify breaking seemingly valid code:
                // https://github.com/facebook/create-react-app/issues/2376
                // Pending further investigation:
                // https://github.com/mishoo/UglifyJS2/issues/2011
                comparisons: false,
                // Disabled because of an issue with Terser breaking valid code:
                // https://github.com/facebook/create-react-app/issues/5250
                // Pending futher investigation:
                // https://github.com/terser-js/terser/issues/120
                inline: 2
              },
              mangle: {
                safari10: true
              },
              output: {
                ecma: 5,
                comments: false,
                // Turned on because emoji and regex is not minified properly using default
                // https://github.com/facebook/create-react-app/issues/2488
                ascii_only: true
              }
            }
          })
        ]
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
      allowlist: [/\.(?!(?:jsx?|json)$).{1,5}$/i, 'webpack/hot/poll?1000']
    })

    config.module.rules = [
      ...config.module.rules,
      // CSS
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
                localIdentName
              }
            }
          }
        ]
      }
    ]

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
      config.watch = true
      // Entry

      config.plugins = [
        ...config.plugins,
        new NodemonPlugin({
          nodeArgs: ['--inspect']
        })
      ]
    }
  }

  return config
}

module.exports = createAsyncConfig
