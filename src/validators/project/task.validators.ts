import { body, checkSchema, query } from 'express-validator'
import { AvailableTaskPriority, AvailableTaskStatus } from '../../constants'

export const projectIdValidator = [
  body('projectId')
    .trim()
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Project ID is invalid'),
]

export const taskValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('priority')
    .trim()
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(AvailableTaskPriority)
    .withMessage('Priority is invalid'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(AvailableTaskStatus)
    .withMessage('Status is invalid'),
  body('taskType').trim().notEmpty().withMessage('Task type is required'),
  body('startDate')
    .trim()
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .toDate()
    .withMessage('Start date is invalid'),
  body('endDate')
    .trim()
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .toDate()
    .withMessage('End date is invalid'),
  ...projectIdValidator,
]

export const validateTaskId = [
  body('taskId')
    .trim()
    .notEmpty()
    .withMessage('Task ID is required')
    .isMongoId()
    .withMessage('Task ID is invalid'),
]

export const validateProjectIdQuery = [
  query('projectId')
    .trim()
    .notEmpty()
    .withMessage('Project ID required')
    .isMongoId()
    .withMessage('Invalid project ID'),
]

export const getTasksValidator = checkSchema(
  {
    title: {
      customSanitizer: {
        options: (value) => {
          if (!value) return ''
          return value
        },
      },
    },

    priority: {
      trim: true,
      customSanitizer: {
        options: (value: unknown) => {
          if (value === 'All') return ''
          return value
        },
      },
    },

    sortByCreated: {
      customSanitizer: {
        options: (value) => {
          if (!value || value === 'false') return false
          return true
        },
      },
    },

    assignedToMe: {
      customSanitizer: {
        options: (value) => {
          if (!value || value === 'false') return false
          return true
        },
      },
    },

    createdByMe: {
      customSanitizer: {
        options: (value) => {
          if (!value || value === 'false') return false
          return true
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
          return isNaN(parsedValue) ? 6 : parsedValue
        },
      },
    },
  },
  ['query']
)

export const assignMemberValidator = [
  ...validateTaskId,
  ...projectIdValidator,
  body('memberId')
    .trim()
    .notEmpty()
    .withMessage('Member ID required')
    .isMongoId()
    .withMessage('Invalid member ID'),
]

export const updateTaskValidator = [...taskValidator, ...validateTaskId]