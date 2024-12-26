import { body, checkSchema } from 'express-validator'

const getMembersQueryValidator = checkSchema(
  {
    email: {
      trim: true,
      customSanitizer: {
        options: (value: unknown) => {
          return value ? value : ''
        },
      },
    },

    invitationStatus: {
      trim: true,
      customSanitizer: {
        options: (value: unknown) => {
          if (value === 'All') return ''
          return value ? value : ''
        },
      },
    },

    page: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value)
          return isNaN(parsedValue) ? 1 : parsedValue
        },
      },
    },

    limit: {
      customSanitizer: {
        options: (value) => {
          const parsedValue = Number(value)
          return isNaN(parsedValue) ? 10 : parsedValue
        },
      },
    },
  },
  ['query']
)

const inviteMemberValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email should be valid email'),

  body('projectId')
    .trim()
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Project ID is Invalid'),
]

export { getMembersQueryValidator, inviteMemberValidator }
