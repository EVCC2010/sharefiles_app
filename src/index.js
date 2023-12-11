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
import ManageFiles from './manageFiles/manageFiles'
import Account from './account/account'
import Help from './help/help'
import { ToastContainer } from 'react-toastify'

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
            {isAuthenticated && (
              <Route path="/manageFiles" element={<ManageFiles />} />
            )}
            {isAuthenticated && <Route path="/account" element={<Account />} />}
            <Route path="/help" element={<Help />} />
            <Route path="/*" element={<Navigate to="/" />} />
          </Routes>
          <Footer />
        </NextUIProvider>
        <ToastContainer />
      </React.StrictMode>
    </BrowserRouter>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
