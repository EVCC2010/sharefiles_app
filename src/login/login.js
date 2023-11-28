import React from 'react'
import { Input, Button } from '@nextui-org/react'

export default function Login() {
  const handleLogin = () => {
    // Add login logic here
    console.log('Login button clicked')
  }

  const handleSignup = () => {
    // Add signup logic here
    console.log('Signup button clicked')
  }

  return (
    <div className="flex justify-center">
      {/* Signup Container */}
      <div className="flex flex-col justify-center items-center m-4 p-4 border border-gray-200 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-4">Signup</h2>
        <div className="flex flex-col gap-2 w-full">
          <Input
            type="text"
            label="First Name"
            placeholder="Enter your first name"
          />
          <Input
            type="text"
            label="Last Name"
            placeholder="Enter your last name"
          />
          <Input type="email" label="Email" placeholder="Enter your email" />
          <Input type="date" label="Date of Birth" />
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
          />
          <Input
            type="password"
            label="Repeat Password"
            placeholder="Repeat your password"
          />
          <Button onClick={handleSignup}>Signup</Button>
        </div>
      </div>

      {/* Login Container */}
      <div className="flex flex-col justify-center items-center m-4 p-4 border border-gray-200 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <div className="flex flex-col gap-2 w-full">
          <Input
            type="text"
            label="Username"
            placeholder="Enter your username"
          />
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
          />
          <Button variant="secondary" onClick={handleLogin}>
            Login
          </Button>
        </div>
      </div>
    </div>
  )
}
