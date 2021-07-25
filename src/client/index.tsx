import React from 'react'
import { hydrate } from 'react-dom'
import { loadableReady } from '@loadable/component'
import App from './App'
import createStore, { Store } from './store'
import { Provider } from 'react-redux'

const initialData: Store = JSON.parse(
  document.getElementById('__INITIAL_DATA__')?.innerText ?? '{}'
)

const store = createStore(initialData)

loadableReady().then(() => {
  const root = document.getElementById('root')
  hydrate(
    <Provider store={store}>
      <App />
    </Provider>,
    root
  )
})

if (module.hot) {
  module.hot.accept()
}
