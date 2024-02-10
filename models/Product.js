import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  codeDealer: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  isOnDemand: {
    type: Boolean,
    required: true,
  },
  priceDealer: {
    type: Number,
    required: true,
  },
  priceSuggest: {
    type: Number,
    required: true,
  },
  priceMarketMin: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: true,
  },
  quantityRaw: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
  },
  categoryFull: {
    type: String,
    required: true,
  },
  // category: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Category',
  //   required: true,
  // },
}, {
  timestamps: true,
})

export default mongoose.model('Product', ProductSchema)
