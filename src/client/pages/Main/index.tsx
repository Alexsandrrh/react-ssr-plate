import React from 'react'
import styles from './Main.module.css'
import IconLayout from '../../assets/icons/layout.svg'
import Icon from '../../components/commons/Icon'

const Page = () => {
  return (
    <div className={styles.Main}>
      <h2 className={styles.Heading}>Main, page!</h2>
      <p className={styles.Text}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, aut
        consequuntur doloribus est expedita explicabo facere, impedit libero
        nesciunt pariatur quasi quidem, quos repellat sed sequi similique totam
        voluptas voluptates.
      </p>
      <p className={styles.Text}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, aut
        consequuntur doloribus est expedita explicabo facere, impedit libero
        nesciunt pariatur quasi quidem, quos repellat sed sequi similique totam
        voluptas voluptates.
      </p>
      <p className={styles.Text}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, aut
        consequuntur doloribus est expedita explicabo facere, impedit libero
        nesciunt pariatur quasi quidem, quos repellat sed sequi similique totam
        voluptas voluptates.
      </p>
      <p className={styles.Text}>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, aut
        consequuntur doloribus est expedita explicabo facere, impedit libero
        nesciunt pariatur quasi quidem, quos repellat sed sequi similique totam
        voluptas voluptates.
      </p>
      <Icon className={styles.Icon} icon={IconLayout} />
    </div>
  )
}

export default Page
