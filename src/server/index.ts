import http from 'http'

let app = require('./app.tsx').default

let currentHandler = app.callback()
const server = http.createServer(currentHandler)

server.listen(process.env.PORT || 4000, () => {
  console.log('Server app started...')
})

if (module.hot) {
  console.log('✅ Hot reload server app enabled!')

  module.hot.accept('./app.tsx', () => {
    console.log('🔁  HMR Reloading `./app.tsx`..')

    try {
      const newHandler = require('./app.tsx').default.callback()
      server.removeListener('request', currentHandler)
      server.on('request', newHandler)
      currentHandler = newHandler
    } catch (error) {
      console.error(error)
    }
  })
}
