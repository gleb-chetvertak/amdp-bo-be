import ProductModel from '../models/Product.js'

const CODE_PREFIXES_BY_GROUP = {
  'Кріплення --- Кріплення': '1-1',
  'Кабель+Контролери --- Кабель для сонячних систем': '1-2',
  'Кабель+Контролери --- Конекторы': '1-3',
  'Кабель+Контролери --- Комплект': '1-4',
  'Кабель+Контролери --- Контролери заряду акумуляторних батарей для сонячних модулів': '1-5',
  'Кабель+Контролери --- Контролери заряду акумуляторных батарей для систем автономного освітлення': '1-6',
  'Кабель+Контролери --- Гібридні контролери \n(вітер + сонце)': '1-7',
  'Stromherz --- Мережеві інвертори': '1-8',
  'Stromherz --- Гібридні інвертори': '1-9',
  'Stromherz --- Акумуляторні батареї': '1-10',
  'Stromherz --- Блок керування зарядом батарей ': '1-11',
  'Stromherz --- Мережеві інвертори (аксесуари)': '1-12',
  'Інвертори --- Акумуляторні батареї': '1-13',
  'Інвертори --- Автономні інвертори': '1-14',
  'Інвертори --- Автономні інвертори (Аксесуари)': '1-15',
  'Інвертори --- Мережеві інвертори (аксесуари)': '1-16',
  'Інвертори --- Сервіс': '1-17',
  'Інвертори --- Мережеві інвертори': '1-18',
  'Інвертори --- Комплектуючі до стрінговому инвертору з ФЕМ ': '1-19',
  'Інвертори --- Мережеві інвертори. Оптимізатори': '1-20',
  'Інвертори --- Гібридні інвертори': '1-21',
  'АКБ+ДБЖ --- Акумуляторні батареї': '1-22',
  'АКБ+ДБЖ --- Перетворювач напруги': '1-23',
  'АКБ+ДБЖ --- Акумуляторні батареї (аксесуари)': '1-24',
  'АКБ+ДБЖ --- Комплект АКБ+ДБЖ': '1-25',
  'Зарядні пристрої --- Портативні зарядні станції': '1-26',
  'Зарядні пристрої --- Акумуляторні батареї': '1-27',
  'Зарядні пристрої --- Портативні розкладні зарядні пристрої': '1-28',
  'Захист+лічильники --- Комплект захисту': '1-29',
  'Вітрогенератори+Освітлення --- Вітрогенератори+Освітлення': '1-30',
}

// ==================================================
// Business logic
// ==================================================

const createOne = async (req, res) => {
  try {
    const {
      code: codeDealer,
      categoryFull,
      title,
      isOnDemand,
      priceDealer,
      priceSuggest,
      priceMarketMin,
      quantity,
      quantityRaw,
      group,
      category,
    } = req.body

    const doc = new ProductModel({
      code: `${CODE_PREFIXES_BY_GROUP[categoryFull]}-${codeDealer}`,
      codeDealer,
      title,
      isOnDemand,
      priceDealer,
      priceSuggest,
      priceMarketMin,
      quantity,
      quantityRaw,
      group,
      category,
      categoryFull,
    })

    const product = await doc.save()

    res.json(product)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to create product' })
  }
}

const createMany = async (req, res) => {
  try {
    const products = req.body

    const docs = products.map(({
      code: codeDealer,
      title,
      isOnDemand,
      priceDealer,
      priceSuggest,
      priceMarketMin,
      quantity,
      quantityRaw,
      group,
      category,
      categoryFull,
    }) => ({
      code: `${CODE_PREFIXES_BY_GROUP[categoryFull]}-${codeDealer}`,
      codeDealer,
      title,
      isOnDemand,
      priceDealer,
      priceSuggest,
      priceMarketMin,
      quantity,
      quantityRaw,
      group,
      category,
      categoryFull,
    }))

    const createdProducts = await ProductModel.insertMany(docs)

    res.json(createdProducts)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to create products' })
  }
}

// ==================================================
// Interfaces
// ==================================================

export const create = async (req, res) => {
  if (Array.isArray(req.body)) await createMany(req, res)
  else await createOne(req, res)
}

export const getAll = async (req, res) => {
  try {
    const products = await ProductModel.find()

    res.json(products)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to find products' })
  }
}

export const getOne = async (req, res) => {
  const { id } = req.params

  try {
    const post = await ProductModel.findById(id)

    if (!post) return res.status(404).json({ message: 'Could not find product' })

    res.json(post)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to find product' })
  }
}

export const update = async (req, res) => {
  // try {
  //   const { id } = req.params

  //   const { title, text, tags, imageUrl } = req.body

  //   await ProductModel.updateOne({
  //     _id: id,
  //   }, {
  //     title,
  //     text,
  //     tags,
  //     imageUrl,
  //   })

  //   res.json({ success: true })
  // } catch (error) {
  //   console.log(error)

  //   res.status(500).json({ message: 'Failed to update post' })
  // }
}

export const removeAll = async (req, res) => {
  try {
    const { deletedCount } = await ProductModel.deleteMany()

    res.json({ success: true, deletedCount })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to delete product' })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params

    const product = await ProductModel.findByIdAndDelete(id)

    if (!product) return res.status(404).json({ message: 'Could not find product' })

    res.json({ success: true, product })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to delete product' })
  }
}
