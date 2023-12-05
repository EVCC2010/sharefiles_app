import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { NextUIProvider } from '@nextui-org/react'
import './css/global.css'
import './css/dashboard.module.css'
import MainMenu from './components/MainMenu'
import Welcome from './welcome/welcome'
import Login from './login/login'
import Signup from './signup/signup'
import Footer from './components/Footer'
import Dashboard from './dashboard/dashboard'

const token = localStorage.getItem('token')
const isAuthenticated = !!token /* Check user authentication */

const App = () => {
  return (
    <BrowserRouter>
      <React.StrictMode>
        <NextUIProvider>
          <MainMenu />
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {isAuthenticated && (
              <Route path="/dashboard" element={<Dashboard />} />
            )}
            <Route path="/*" element={<Navigate to="/" />} />
          </Routes>
          <Footer />
        </NextUIProvider>
      </React.StrictMode>
    </BrowserRouter>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
