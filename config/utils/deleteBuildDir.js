const rimraf = require('rimraf')
const path = require('path')

module.exports = () =>
  new Promise((resolve, reject) => {
    rimraf(path.resolve('dist'), {}, (err) => {
      if (err) reject(err)
      resolve()
    })
  })
