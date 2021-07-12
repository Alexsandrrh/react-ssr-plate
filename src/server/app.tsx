import Koa from 'koa'
import Router from 'koa-router'
import helmet from 'koa-helmet'
import serve from 'koa-static'
import React from 'react'
import { renderToString } from 'react-dom/server'
import HTML from './HTML'
import App from '../client/App'

const router = new Router()

// Ping route
router.get('/ping', (ctx) => {
  ctx.body = 'Hello, world!'
})

// SSR route
router.get('(.*)', (ctx) => {
	// Set HTML
	ctx.type = 'html'

  const html = renderToString(<HTML App={App} />)
  ctx.body = html
})

const app = new Koa()

app
  .use(helmet())
  .use(serve(process.env.PUBLIC_DIR))
  .use(router.routes())
  .use(router.allowedMethods())

export default app
