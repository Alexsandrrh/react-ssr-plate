const path = require('path')
const rimraf = require('rimraf')
const { webpack } = require('webpack')
const createWebpackConfig = require('../config/createWebpackConfig')

const script = async () => {
  // Clear console
  console.log()

  // Delete dist dir
  rimraf(path.resolve('dist'), {}, (err) => {})

  // Create configs
  const clientConfig = await createWebpackConfig('client', 'production')
  const serverConfig = await createWebpackConfig('server', 'production')

  // Build apps
  webpack(clientConfig).run()
  webpack(serverConfig).run((err, stats) => {
  	console.log(err)
	})
}

script().then(() => console.log('Build success!!!'))
