import React from 'react'
import express, { Request, Response } from 'express'
import helmet from 'helmet'
import createStore from '../client/store'
import { renderToNodeStream } from 'react-dom/server'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router'
import Routes from '../client/pages'
import HTML from './HTML'
import path from 'path'

const app = express()

// Middlewares
app
  .use(helmet({ contentSecurityPolicy: false }))
  .use(express.static(path.resolve('dist', 'public')))

// Request logger
app.use

// Checker of status app
app.get('/status', (req: Request, res: Response) => res.status(200).send('OK'))

// React app
app.get('*', (req: Request, res: Response) => {
  // Создаем State Manager
  const store = createStore()
  const actions: any = []

  Promise.all(actions).finally(() => {
    // Создаем контекст для роутинга
    const ctx = {}

    // Рендерим
    const stream = renderToNodeStream(
      <Provider store={store}>
        <StaticRouter location={req.url} context={ctx}>
          <HTML App={Routes} initialData={store.getState()} />
        </StaticRouter>
      </Provider>
    )

    res.type('html').status(200).write('<!DOCTYPE html>')
    stream.pipe(res, { end: true })
  })
})

export default app
