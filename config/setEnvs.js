module.exports = (target, nodeEnv) => {
  const isClient = target === 'client'
  const isServer = target === 'server'
  const isDev = nodeEnv === 'development'
  const isProd = nodeEnv === 'production'
  const clientPublicPath = isDev ? process.env.PUBLIC_PATH : '/'

  process.env.NODE_ENV = nodeEnv
  process.env.PUBLIC_PATH = clientPublicPath
  process.env.IS_CLIENT = isClient
  process.env.IS_SERVER = isServer
  process.env.IS_PROD = isProd
  process.env.IS_DEV = isDev

  return {
    isClient,
    isServer,
    isProd,
    isDev,
    clientPublicPath
  }
}
