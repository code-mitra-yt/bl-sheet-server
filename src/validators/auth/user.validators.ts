import { body } from 'express-validator'

const userRegisterValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email is invalid'),

  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters long'),
]

const verifyEmailAndCreatePassowordValidator = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  body('token').trim().notEmpty().withMessage('Token is required'),
]

const userLoginValidator = [
  body('password').trim().notEmpty().withMessage('Password is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email is invalid'),
]

const userEmailValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email is invalid'),
]

const tokenValidator = [
  body('token').trim().notEmpty().withMessage('Token is required'),
]

export {
  userRegisterValidator,
  verifyEmailAndCreatePassowordValidator,
  userLoginValidator,
  userEmailValidator,
  tokenValidator,
}
