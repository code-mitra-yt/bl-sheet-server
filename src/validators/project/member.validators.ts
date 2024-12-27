import { body, checkSchema } from 'express-validator'
import {
  AvailableInvitationStatus,
  AvailableMemberRoles,
} from '../../constants'

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

const changeInvitationStatusValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email should be valid email'),

  body('invitationStatus')
    .trim()
    .notEmpty()
    .withMessage('Invitation status required')
    .isIn(AvailableInvitationStatus)
    .withMessage('Invalid invitation status'),

  body('invitationToken')
    .trim()
    .notEmpty()
    .withMessage('Invitation token is required'),
]

const removeMemberValidator = [
  body('projectId')
    .trim()
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Project ID is Invalid'),

  body('memberId')
    .trim()
    .notEmpty()
    .withMessage('Member ID is required')
    .isMongoId()
    .withMessage('Member ID is Invalid'),
]

const updateMemberValidator = [
  ...removeMemberValidator,
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(AvailableMemberRoles)
    .withMessage('Role is invalid'),
]

export {
  getMembersQueryValidator,
  inviteMemberValidator,
  changeInvitationStatusValidator,
  removeMemberValidator,
  updateMemberValidator,
}
