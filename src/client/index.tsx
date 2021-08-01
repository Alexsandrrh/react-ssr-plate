import React from 'react'
import { hydrate } from 'react-dom'
import { loadableReady } from '@loadable/component'
import createStore, { Store } from './store'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Routes from './pages'
import './assets/styles/main.css'

const initialData: Store = JSON.parse(
  document.getElementById('__INITIAL_DATA__')?.innerText ?? '{}'
)

const store = createStore(initialData)

loadableReady().then(() => {
  const root = document.getElementById('root')
  hydrate(
    <Provider store={store}>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </Provider>,
    root
  )
})

if (module.hot) {
  module.hot.accept()
}
