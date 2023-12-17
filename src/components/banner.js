import React, { useState, useEffect } from 'react'
import styles from '../css/banner.module.css'

const Banner = ({ message }) => {
  const [showBanner, setShowBanner] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowBanner(false)
    }, 10000) // Hide the banner after 10 seconds

    return () => clearTimeout(timeout)
  }, []) // Run the effect only once on component mount

  if (!showBanner) {
    return null
  }

  return <div className={styles.banner}>{message}</div>
}

export default Banner
