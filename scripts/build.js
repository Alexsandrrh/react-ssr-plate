const deleteBuildDir = require('../config/utils/deleteBuildDir')

const createWebpackConfig = require('../config/createAsyncConfig')
const compiler = require('../config/utils/compiler')

const script = async () => {
  try {
    // Clear console
    console.log()

    // Delete dist dir
    await deleteBuildDir()

    // Create configs
    const clientConfig = await createWebpackConfig('client', 'production')
    const serverConfig = await createWebpackConfig('server', 'production')

    // Build apps
    await compiler(clientConfig)
    await compiler(serverConfig)
  } catch (e) {
    console.log(e)
  }
}

script()
