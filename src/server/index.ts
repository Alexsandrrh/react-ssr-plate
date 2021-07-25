import express from 'express'

let app = require('./app').default

if (module.hot) {
  module.hot.accept('./app', function () {
    console.log('🔁  HMR Reloading `./app`...')
    try {
      app = require('./app').default
    } catch (error) {
      console.error(error)
    }
  })
  console.info('✅  Server-side HMR Enabled!')
}

const PORT = process.env.PORT ?? 4000

export default express()
  .use((req, res) => app.handle(req, res))
  .listen(PORT, () => {
    console.log(`> Started on port ${PORT}`)
  })
