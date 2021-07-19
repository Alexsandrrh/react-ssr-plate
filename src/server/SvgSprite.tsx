import React from 'react'

// @ts-ignore
import sprite from 'svg-sprite-loader/runtime/sprite.build'

const symbols = sprite.symbols.map((item: any) => item.content).join('')

const SvgSprite = () => {
  const { config } = sprite
  const { attrs } = config

  return (
    <svg
      id={attrs.id}
      xmlns={attrs.xmlns}
      xmlnsXlink={attrs['xmlns:xlink']}
      style={{ position: 'absolute', width: '0', height: '0', display: 'none' }}
      dangerouslySetInnerHTML={{
        __html: symbols
      }}
    />
  )
}

export default SvgSprite
