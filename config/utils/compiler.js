const { webpack } = require('webpack')

/**
 * @name compiler
 * @param {Object} config
 * */
module.exports = (config) => {
  let compiler
  try {
    compiler = webpack(config)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  return compiler
}
