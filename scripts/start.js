const { choosePort } = require('react-dev-utils/WebpackDevServerUtils')
const createWebpackConfig = require('../config/createAsyncConfig')
const DevServer = require('webpack-dev-server')
const compiler = require('../config/utils/compiler')
const deleteBuildDir = require('../config/utils/deleteBuildDir')

const script = async () => {
  const noop = () => {}

  // Clear console
  console.clear()

  // Remove last build dir
  await deleteBuildDir()

  // Find free port
  const PORT = await choosePort('localhost', process.env.DEV_PORT ?? 4040)

  // Set envs
  process.env.DEV_PORT = PORT.toString()
  process.env.DEV_HOST = 'localhost'
  process.env.PUBLIC_PATH = `http://${process.env.DEV_HOST}:${PORT}/`

  // Building client
  const clientConfig = await createWebpackConfig('client', 'development')
  const clientCompiler = compiler(clientConfig)

  // Building server
  const serverConfig = await createWebpackConfig('server', 'development')
  const serverCompiler = compiler(serverConfig)

  // Create Dev Server
  const devServer = new DevServer(clientCompiler, clientConfig.devServer)

  devServer.listen(PORT, 'localhost', noop)

  serverCompiler.watch({ stats: 'errors-only' }, noop)
}

script()
