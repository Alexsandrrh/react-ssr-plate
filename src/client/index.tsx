import React from 'react'
import { hydrate } from 'react-dom'
import { loadableReady } from '@loadable/component'
import App from './App'

loadableReady().then(() => {
  const root = document.getElementById('app')
  hydrate(<App />, root)
})

if (module.hot) {
  module.hot.accept()
}
