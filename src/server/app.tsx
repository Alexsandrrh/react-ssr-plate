import Koa, { Context } from 'koa'
import Router from 'koa-router'
import helmet from 'koa-helmet'
import serve from 'koa-static'
import path from 'path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import HTML from './HTML'
import App from '../client/App'
import { StaticRouter, StaticRouterContext } from 'react-router'
import createStore from '../client/store'
import { Provider } from 'react-redux'

const router = new Router()

// SSR route
router.get('/(.*)', (ctx: Context) => {
  const store = createStore()

  Promise.all([]).finally(() => {
    const context: StaticRouterContext = {}
    const html = renderToString(
      <Provider store={store}>
        <StaticRouter location={ctx.url} context={context}>
          <HTML App={App} initialData={store.getState()} />
        </StaticRouter>
      </Provider>
    )

    // Редирект
    if (context.url) {
      return ctx.redirect(context.url)
    }

    ctx.type = 'html'
    ctx.res.write('<!DOCTYPE html>')
    ctx.body = html
  })
})

const app = new Koa()

app
  .use(
    helmet({
      contentSecurityPolicy: false
    })
  )
  .use(serve(process.env.PUBLIC_DIR ?? path.resolve('public')))
  .use(router.routes())
  .use(router.allowedMethods())

export default app
