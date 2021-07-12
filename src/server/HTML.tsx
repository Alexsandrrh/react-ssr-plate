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
    <html>
      <head>
        {extractor.getLinkElements()}
        {extractor.getStyleElements()}
      </head>
      <body>
        <div id="app">{jsx}</div>
        <div id="popup" />
        {extractor.getScriptElements()}
      </body>
    </html>
  )
}

export default HTML
