import React, { useState } from 'react'
import { Input, Button } from '@nextui-org/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import ReCAPTCHA from 'react-google-recaptcha'
import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const Login = () => {
  const [loginSuccess, setloginSuccess] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')

  const clearErrors = () => {
    setLoginError('')
    setloginSuccess(false)
  }

  const handleLogin = async (values, recaptchaToken) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/login`,
        {
          email: values.email,
          password: values.password,
          recaptchaToken: recaptchaToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 200) {
        const token = response.data.token

        // Store the token in a secure HTTP-only cookie and localStorage
        document.cookie = `token=${token}; Secure; HttpOnly; SameSite=Strict`
        localStorage.setItem('token', token)

        // Handle login success
        setloginSuccess(true)
        console.log('Login successful')
        toast.success('Login successful, loading your dashboard!')

        // Redirect to the dashboard after successful login
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 3000)
      } else {
        // Handle login failure
        const errorMessage =
          response.data.message ||
          'Login failed. Please check your credentials.'
        console.error(errorMessage)
        toast.error(errorMessage)
        setLoginError('Login failed. Please check your credentials.')

        // Clear errors after a certain duration
        setTimeout(clearErrors, 3000)
      }
    } catch (error) {
      // Handle network or other errors
      console.error('Error', error)
      toast.error('An error occurred while logging in. Please try again.')

      // Clear errors after a certain duration
      setTimeout(clearErrors, 3000)
    }
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-center items-center m-4 p-4 border border-gray-200 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        {loginSuccess && <p className="text-green-500">Login successful!</p>}
        {loginError && <p className="text-red-500">{loginError}</p>}

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
            handleLogin(values, recaptchaToken)
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
                onFocus={clearErrors}
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
                onFocus={clearErrors}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500"
              />
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={(token) => {
                  setRecaptchaToken(token)
                  clearErrors()
                }}
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
