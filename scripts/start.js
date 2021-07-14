const { choosePort } = require('react-dev-utils/WebpackDevServerUtils')
const createWebpackConfig = require('../config/createAsyncConfig')
const DevServer = require('webpack-dev-server')
const compiler = require('../config/utils/compiler')
const deleteBuildDir = require('../config/utils/deleteBuildDir')

const script = async () => {
  // Clear console
  console.log()

  // Remove last build dir
  await deleteBuildDir()

  // Find free port
  const PORT = await choosePort('localhost', process.env.DEV_PORT ?? 4040)

  // Set envs
  process.env.DEV_PORT = PORT.toString()
  process.env.DEV_HOST = 'localhost'
  process.env.PUBLIC_PATH = `http://${process.env.DEV_HOST}:${PORT}/`

  // Configs
  const clientConfig = await createWebpackConfig('client', 'development')
  const serverConfig = await createWebpackConfig('server', 'development')

  // Compilers
  const clientCompiler = compiler(clientConfig)
  const serverCompiler = compiler(serverConfig)

  // Initiate dev server
  const devServer = new DevServer(clientCompiler)

  devServer.listen(PORT, () => {
    console.log('Starting dev server)')
  })

  serverCompiler.watch({ stats: 'none' }, () => {})
}

script()
