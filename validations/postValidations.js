import { body } from 'express-validator'

export const createPostValidation = [
  body('title', '').isLength({ min: 3 }),
  body('text', 'Post text is required').isLength({ min: 5 }),
  body('tags', '').optional().isArray(),
  body('image').optional(),
]

export const updatePostValidation = [
  body('title', '').optional().isLength({ min: 3 }),
  body('text', 'Post text is required').optional().isLength({ min: 5 }),
  body('tags', '').optional().isArray(),
  body('image').optional(),
]
