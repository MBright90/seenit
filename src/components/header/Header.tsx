import React from 'react'
import { logo } from '@assets/images'

import UserStatus from './userStatus'

import style from './Header.module.scss'

const Header: React.FC = () => {
  //Create useState here which adjusts the size of the header when scrolled down.

  return (
    <header className={style.header} data-testid="header">
      <img className={style.headerLogo} src={logo} alt="SeenIt-logo-blue"></img>
      <UserStatus />
    </header>
  )
}

export default Header
