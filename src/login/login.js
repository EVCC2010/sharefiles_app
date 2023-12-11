import React from 'react'
import { Input, Button } from '@nextui-org/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const Login = () => {
  const handleLogin = async (values) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const token = data.token

        // Store the token in a secure HTTP-only cookie
        document.cookie = `token=${token}; Secure; HttpOnly; SameSite=Strict`
        localStorage.setItem('token', token)
        console.log('Login successful')
        window.location.href = '/dashboard'
      } else {
        const errorMessage = await response.json()
        console.error(errorMessage)
        toast.error('Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Error', error)
      toast.error('An error occurred while logging in. Please try again.')
    }
  }

  return (
    <div className="flex justify-center">
      {/* Login Container */}
      <div className="flex flex-col justify-center items-center m-4 p-4 border border-gray-200 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email('Invalid email')
              .required('Email is required'),
            password: Yup.string().required('Password is required'),
          })}
          onSubmit={(values, { setSubmitting }) => {
            handleLogin(values)
            setSubmitting(false)
          }}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-2 w-full">
              <Field
                type="text"
                name="email"
                as={Input}
                label="Email"
                placeholder="Enter your E-mail"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500"
              />

              <Field
                type="password"
                name="password"
                as={Input}
                label="Password"
                placeholder="Enter your password"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500"
              />

              <Button type="submit" variant="secondary" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default Login
