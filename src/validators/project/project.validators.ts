import { body, query } from 'express-validator'

const projectValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
]

const projectIdValidator = [
  body('_id')
    .trim()
    .notEmpty()
    .withMessage('Project ID required')
    .isMongoId()
    .withMessage('Invalid project ID'),
]

const projectIdQueryValidator = [
  query('projectId')
    .trim()
    .notEmpty()
    .withMessage('Project ID required')
    .isMongoId()
    .withMessage('Invalid project ID'),
]

export { projectValidator, projectIdValidator, projectIdQueryValidator }
