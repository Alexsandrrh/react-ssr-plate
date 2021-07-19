import React from 'react'
import styles from './Icon.module.css'
import cn from 'classnames'

interface Props {
  icon: {
    viewBox: string
    id: string
  }
  className: string
}

const Icon = ({ icon, className }: Props) => {
  return (
    <svg viewBox={icon.viewBox} className={cn(styles.Icon, className)}>
      <use xlinkHref={`#${icon.id}`} />
    </svg>
  )
}

export default Icon
