import React from 'react'
import path from 'path'
import { ChunkExtractor } from '@loadable/server'

interface Props {
  App: any
}

const statsFile = path.resolve('dist', 'loadable-stats.json')
const extractor = new ChunkExtractor({ statsFile, entrypoints: ['bundle'] })

const HTML = ({ App }: Props) => {
  const jsx = extractor.collectChunks(<App />)

  return (
    <html lang="en-EN">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, maximum-scale=1, initial-scale=1, user-scalable=0"
        />

        {extractor.getLinkElements()}
        {extractor.getStyleElements()}
      </head>
      <body>
        <div id="app">{jsx}</div>
        <div id="popup" />
        <script id="__INITIAL_DATA__" type="application/json" />
        {extractor.getScriptElements()}
      </body>
    </html>
  )
}

export default HTML
