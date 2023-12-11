import React, { useState, useEffect } from 'react'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from '@nextui-org/react'
import { AcmeLogo } from './AcmeLogo.jsx'

const MainMenu = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token) // Set login status based on the token existence
  }, [])

  const handleLogout = () => {
    try {
      localStorage.removeItem('token') // Remove the token from localStorage
      setIsLoggedIn(false)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Navbar>
      <NavbarBrand>
        <AcmeLogo />
        <p className="font-bold text-inherit">ShareFiles</p>
      </NavbarBrand>
      <NavbarContent className="sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/">
            Home
          </Link>
        </NavbarItem>
        {isLoggedIn && (
          <NavbarItem>
            <Link color="foreground" href="/manageFiles">
              Files
            </Link>
          </NavbarItem>
        )}
        {isLoggedIn && (
          <NavbarItem>
            <Link color="foreground" href="/dashboard">
              Dashboard
            </Link>
          </NavbarItem>
        )}
        {isLoggedIn && (
          <NavbarItem>
            <Link color="foreground" href="/account">
              Account
            </Link>
          </NavbarItem>
        )}
        <NavbarItem>
          <Link color="foreground" href="/help">
            Help & Support
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        {isLoggedIn ? (
          <NavbarItem>
            <Button color="primary" variant="flat" onClick={handleLogout}>
              Logout
            </Button>
          </NavbarItem>
        ) : (
          <NavbarItem>
            <Button as={Link} color="primary" href="/login" variant="flat">
              Login
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  )
}

export default MainMenu
