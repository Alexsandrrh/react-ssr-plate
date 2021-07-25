import React from 'react'
import routes from './routes'
import { Switch, Route } from 'react-router'

const Routes = () => {
  return (
    <Switch>
      {routes.map((route, key) => (
        <Route key={key} {...route} />
      ))}
    </Switch>
  )
}

export default Routes
