import omit from 'lodash/omit.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// import UserModel from '../models/User.js'

export const register = async (req, res) => {
  try {
    const { email, password, fullName, avatarUrl } = req.body

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const doc = new UserModel({
      email,
      passwordHash,
      fullName,
      avatarUrl,
    })

    const user = await doc.save()

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    )

    res.json({
      ...omit(user._doc, ['passwordHash']),
      token,
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Could not register' })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json(omit(user._doc, ['passwordHash']))
  } catch (error) {
    console.log(error)

    return res.status(403).json('Access denied')
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await UserModel.findOne({ email })

    if (!user) return res.status(404).json({ message: 'User not found' })

    const isValidPassword = await bcrypt.compare(password, user._doc.passwordHash)

    if (!isValidPassword) return res.status(400).json({ message: 'Incorrect email or password ' })

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    )

    res.json({
      ...omit(user._doc, ['passwordHash']),
      token,
    })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Could not login' })
  }
}
