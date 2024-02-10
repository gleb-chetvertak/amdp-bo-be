import { body } from 'express-validator'

export const loginValidation = [
  body('email', 'Invalid email').isEmail(),
  body('password'),
]

export const registerValidation = [
  body('email', 'Invalid email').isEmail(),
  body('password', 'Password must include minimum 5 symbols').isLength({ min: 5 }),
  body('fullName', 'Name is required'),
  body('avatarUrl', 'Invalid url format').optional().isURL(),
]
