import React, { useState } from 'react'
import { Input, Button } from '@nextui-org/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import { toast } from 'react-toastify'
import '../../css/signup.module.css'
import ReCAPTCHA from 'react-google-recaptcha'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const Signup = () => {
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupError, setSignupError] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState('')

  const handleSignup = async (values, { setSubmitting, resetForm }) => {
    const payload = { ...values, recaptchaToken }

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, payload)
      console.log('Signup successful:', response.data)
      setSignupSuccess(true)
      resetForm()
      toast.success(
        "Your account has been succesfully created, you'll receive a confirmation email once your account is ready to use."
      )
      setTimeout(() => {
        window.location.href = '/'
      }, 5000)
    } catch (error) {
      console.error('Error:', error.message)
      setSignupError('Signup failed. Please try again.')
      toast.error('Signup failed, please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const validationSchema = Yup.object().shape({
    first_name: Yup.string().required('First Name is required'),
    last_name: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    date_of_birth: Yup.date().required('Date of Birth is required'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
        'Password must contain at least one uppercase letter and one special character'
      ),
    retype_password: Yup.string()
      .required('Retype Password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  })

  const clearErrors = () => {
    setSignupError('')
    setSignupSuccess(false)
  }
  return (
    <div className="flex justify-center">
      <div className="flex flex-col justify-center items-center m-4 p-4 border border-gray-200 rounded-md shadow-md">
        <h2 className="text-xl font-semibold mb-4">Signup</h2>
        {signupSuccess && <p className="text-green-500">Signup successful!</p>}
        {signupError && <p className="text-red-500">{signupError}</p>}
        <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            email: '',
            date_of_birth: '',
            password: '',
            retype_password: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSignup}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-2 w-full">
              <Field
                type="text"
                name="first_name"
                as={Input}
                label="First Name"
                onFocus={clearErrors}
              />
              <ErrorMessage
                name="first_name"
                component="div"
                className="text-red-500"
              />

              <Field
                type="text"
                name="last_name"
                as={Input}
                label="Last Name"
                onFocus={clearErrors}
              />
              <ErrorMessage
                name="last_name"
                component="div"
                className="text-red-500"
              />

              <Field
                type="email"
                name="email"
                as={Input}
                label="Email"
                onFocus={clearErrors}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500"
              />

              <Field
                type="date"
                name="date_of_birth"
                as={Input}
                label="Date of Birth"
                onFocus={clearErrors}
              />
              <ErrorMessage
                name="date_of_birth"
                component="div"
                className="text-red-500"
              />

              <Field
                type="password"
                name="password"
                as={Input}
                label="Password"
                onFocus={clearErrors}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500"
              />
              <Field
                type="password"
                name="retype_password"
                as={Input}
                label="Retype Password"
                onFocus={clearErrors}
              />
              <ErrorMessage
                name="retype_password"
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
                {isSubmitting ? 'Signing Up...' : 'Signup'}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default Signup
