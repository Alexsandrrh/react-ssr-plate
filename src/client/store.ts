import * as Redux from 'redux'
import thunk from 'redux-thunk'
import reducers from './reducers'

const createStore = (initialState: any = {}) =>
  Redux.createStore(reducers, initialState, Redux.applyMiddleware(thunk))

const rootStore = createStore()

export type Store = ReturnType<typeof rootStore.getState>
export default createStore
