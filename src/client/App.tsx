import React from 'react'
import loadable from '@loadable/component'
import './assets/styles/index.css'

const Main = loadable(() => import('./pages/Main'))

const App = () => {
  return (
    <div>
      <h1>Hello, world!</h1>
      <Main />
    </div>
  )
}

export default App
