import loadable from '@loadable/component'

export default [
  {
    path: '/',
    exact: true,
    component: loadable(() => import('./Main'))
  },
  {
    path: '*',
    component: loadable(() => import('./404'))
  }
]
