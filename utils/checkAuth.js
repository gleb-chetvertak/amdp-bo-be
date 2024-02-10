import jwt from 'jsonwebtoken'

export default (req, res, next) => {
  const { authorization } = req.headers

  const token = (authorization || '').replace('Bearer ', '')

  if (!token) return res.status(403).json('Access denied')

  try {
    const decoded = jwt.verify(token, 'secret123')

    req.userId = decoded._id

    next()
  } catch (error) {
    return res.status(403).json('Access denied')
  }
}
