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
  const PORT = await choosePort('localhost', 3000)

  // Set publicPath
  process.env.PUBLIC_PATH = `http://localhost:${PORT}/`

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
