import React, { useState } from 'react'
import { logo } from '@assets/images'

import style from './LandingPage.module.scss'

const LandingPage: React.FC = () => {
  const [authStatus, setAuthStatus] = useState(false)

  function signIn() {
    setAuthStatus(!authStatus)
  }

  return (
    <div className={style.landingPage}>
      <div className={style.tagline}>
        <img src={logo} />
      </div>
      <div className={style.loginContainer}>
        <button className={style.loginButton} onClick={signIn}>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

export default LandingPage
