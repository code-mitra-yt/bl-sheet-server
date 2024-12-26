import { checkSchema } from 'express-validator'

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

export { getMembersQueryValidator }
