import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { NextUIProvider } from '@nextui-org/react'
import './css/global.css'
import MainMenu from './components/MainMenu'
import Welcome from './welcome/welcome'
import Login from './login/login'
import Footer from './components/Footer'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <BrowserRouter>
    <React.StrictMode>
      <NextUIProvider>
        <MainMenu />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </NextUIProvider>
    </React.StrictMode>
  </BrowserRouter>
)
