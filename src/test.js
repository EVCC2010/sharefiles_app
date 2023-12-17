import React from 'react'
import { render, screen } from '@testing-library/react'
import Welcome from './pages/welcome/welcome' // Adjust the path to your Welcome component
import '@testing-library/jest-dom/extend-expect'

describe('Welcome component', () => {
  it('renders Welcome message and link to signup page', () => {
    render(<Welcome />)

    // Check if the welcome text is rendered
    const welcomeText = screen.getByText('Welcome to ShareFiles')
    expect(welcomeText).toBeInTheDocument()

    // Check if the link to signup page is rendered
    const signupLink = screen.getByText(
      'New user? Sign up here to begin sharing securely.'
    )
    expect(signupLink).toBeInTheDocument()
    expect(signupLink).toHaveAttribute('href', '/signup') // Verify if the link points to the signup page
  })

  // You can add more tests for specific elements or functionality of the Welcome component
})
