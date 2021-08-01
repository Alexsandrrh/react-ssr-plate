export {}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any
  }
}

declare module '*.svg' {
  const content: any
  export default content
}
