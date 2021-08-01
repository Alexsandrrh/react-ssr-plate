import React from 'react'
import path from 'path'
import { ChunkExtractor } from '@loadable/server'
import { Helmet } from 'react-helmet'
import SvgSprite from './SvgSprite'
import { Store } from '../client/store'

interface Props {
  App: any
  initialData: Store
}

// Loadable component
const statsFile = path.resolve('dist', 'loadable-stats.json')

// Helmet
const helmet = Helmet.renderStatic()
const htmlAttrs = helmet.htmlAttributes.toComponent()
const bodyAttrs = helmet.bodyAttributes.toComponent()

const HTML = ({ App, initialData }: Props) => {
  const extractor = new ChunkExtractor({ statsFile, entrypoints: ['bundle'] })
  const jsx = extractor.collectChunks(<App />)

  return (
    <html {...htmlAttrs}>
      <head>
        {helmet.title.toComponent()}
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, maximum-scale=1, initial-scale=1, user-scalable=0"
        />
        <link rel="canonical" href="https://example.ru/" />
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}
        {extractor.getLinkElements()}
        {extractor.getStyleElements()}
      </head>
      <body {...bodyAttrs}>
        <SvgSprite />
        <div id="root">{jsx}</div>
        <div id="popup" />
        <script
          id="__INITIAL_DATA__"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(initialData).replace(/</g, '\\u003c')
          }}
        />
        {extractor.getScriptElements()}
      </body>
    </html>
  )
}

export default HTML
