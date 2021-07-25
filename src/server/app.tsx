import React from 'react'
import express, { Request, Response } from 'express'
import createStore from '../client/store'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { StaticRouter } from 'react-router'
import Routes from '../client/pages'
import HTML from './HTML'

const app = express()

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

    // Рендерим в html
    const html = renderToString(
      <Provider store={store}>
        <StaticRouter location={req.url} context={ctx}>
          <HTML App={Routes} initialData={store.getState()} />
        </StaticRouter>
      </Provider>
    )

    res.status(200).send(html)
  })
})

export default app
