import React, { useState } from 'react'
import { Input, Button } from '@nextui-org/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'

const Signup = () => {
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupError, setSignupError] = useState('')

  const handleSignup = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axios.post('http://localhost:4000/signup', values)
      console.log('Signup successful:', response.data)
      setSignupSuccess(true)
      resetForm()
      // Handle success or navigate to a different page after successful signup
      alert(
        "Your account has been succesfully requested, you'll receive a confirmation email once your account is ready to use."
      )
      window.location.href = '/'
    } catch (error) {
      console.error('Error:', error.message)
      setSignupError('Signup failed. Please try again.')
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
      .matches(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/,
        'Password must contain at least one uppercase letter, one special character, and be at least 8 characters long'
      ),
    retype_password: Yup.string()
      .required('Retype Password is required')
      .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  })

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
              />
              <ErrorMessage
                name="last_name"
                component="div"
                className="text-red-500"
              />

              <Field type="email" name="email" as={Input} label="Email" />
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
              />
              <ErrorMessage
                name="retype_password"
                component="div"
                className="text-red-500"
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
