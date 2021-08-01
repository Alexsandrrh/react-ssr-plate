const { webpack } = require('webpack')

/**
 * @name compiler
 * @param {Object} config
 * @return {Compiler}
 * */
module.exports = (config) => {
  let compiler = null
  try {
    compiler = webpack(config, null)
  } catch (e) {
    console.log('COMPILER_ERROR', e)
    process.exit(1)
  }
  return compiler
}
