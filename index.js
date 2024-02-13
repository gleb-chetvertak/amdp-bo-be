import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'

import { loginValidation, registerValidation, createPostValidation, updatePostValidation } from './validations/index.js'
import { checkAuth, handleValidationErrors } from './utils/index.js'

import { ProductController, PriceListAltekController, PriceListViatekController, VolterHistoryController } from './controllers/index.js'

mongoose
  .connect('mongodb+srv://root:123@amdp-back-office-v1.s9i03uo.mongodb.net/amdp_back_office_v1?retryWrites=true&w=majority')
  .then(() => console.log('DB OK'))
  .catch((error) => console.log('DB ERROR', error))

const app = express()

const storage = multer.diskStorage({
  destination: (_, __, callback) => callback(null, 'uploads'),
  filename: (_, file, callback) => callback(null, file.originalname),
})

const upload = multer({ storage })

const priceListsStorage = multer.diskStorage({
  destination: (_, __, callback) => callback(null, 'uploads/price-lists'),
  filename: (_, file, callback) => callback(null, file.originalname),
})

const priceListsUpload = multer({ storage: priceListsStorage })

app.use(express.json())

app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)
// app.get('/auth/me', checkAuth, UserController.getMe)
// app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login)

// app.post('/posts', checkAuth, createPostValidation, handleValidationErrors, PostController.create)
// app.get('/posts', PostController.getAll)
// app.get('/posts/:id', PostController.getOne)
// app.patch('/posts/:id', checkAuth, updatePostValidation, handleValidationErrors, PostController.update)
// app.delete('/posts/:id', checkAuth, PostController.remove)

// app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
//   const { file } = req

//   res.json({ url: `/uploads/${file.originalname}` })
// })

// ==================================================
// Price lists
// ==================================================

app.post('/price-lists/upload', priceListsUpload.single('price-list'), (req, res) => {
  const { file } = req

  res.json({ url: `/uploads/price-lists/${file.originalname}` })
})

app.post('/price-lists/altek', priceListsUpload.single('price-list'), PriceListAltekController.create)

app.get('/price-lists/altek', PriceListAltekController.get)

app.get('/price-lists/viatek', PriceListViatekController.get)

// ==================================================
// Products
// ==================================================

app.post('/products', ProductController.create)

app.get('/products', ProductController.getAll)

app.get('/products/:id', ProductController.getOne)

app.delete('/products', ProductController.removeAll)

app.delete('/products/:id', ProductController.remove)

// ==================================================
// Volter history
// ==================================================

app.get('/volter-history', VolterHistoryController.get)

app.listen(4444, (error) => {
  if (error) return console.log(error)

  console.log('Server OK')
})

// Test comment
// Test comment
