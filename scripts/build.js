const deleteBuildDir = require('../config/utils/deleteBuildDir')

const createWebpackConfig = require('../config/createAsyncConfig')
const compiler = require('../config/utils/compiler')

const script = async () => {
  try {
    // Clear console
    console.clear()

    // Delete dist dir
    await deleteBuildDir()

    // Create configs
    const clientConfig = await createWebpackConfig('client', 'production')
    const serverConfig = await createWebpackConfig('server', 'production')

    // Build apps
    const clientCompiler = await compiler(clientConfig)
    const serverCompiler = await compiler(serverConfig)

    clientCompiler.run()
    serverCompiler.run()
  } catch (e) {
    console.log(e)
  }
}

script()
