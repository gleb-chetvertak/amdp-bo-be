// Manipulates only viatek price lists:
// 1. Upload provider's price list, store it as it is
// 2. Fetch provider's price list, store it as it is
// 3. Transform provider's price list into json

import { promises as fs } from 'fs'
import { createRequire } from 'module'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import cloneDeep from 'lodash/cloneDeep.js'
import axios from 'axios'

import { replaceMultiple, getNestedProperty, setNestedProperty } from '../utils/index.js'

const require = createRequire(import.meta.url)
const priceListConfig = require('../database/price-lists-configs/viatekXML.json')

const { CATEGORIES_TO_PARSE, SUBCATEGORIES_TO_PARSE, FORBIDDEN_WORDS, CATEGORY_PROPERTIES_TO_VALIDATE, PRODUCT_PROPERTIES_TO_VALIDATE } = priceListConfig

// ==================================================
// Helpers
// ==================================================

// ==================================================
// Business logic
// ==================================================

// Read and write files

const refreshPriceListProviderXML = async () => {
  const priceList = (await axios.get('https://viatec.ua/files/product_info_yml.xml', {
    headers: {
      Accept: 'application/xml',
    },
  })).data

  await fs.writeFile('uploads/price-lists/viatek-provider.xml', priceList, 'utf8')
}

const readPriceListProviderXML = () => fs.readFile('uploads/price-lists/viatek-provider.xml', 'utf8', (error, data) => {
  if (error) throw error

  return data
})

const storePriceListXML = async (priceList) => {
  await fs.writeFile('uploads/price-lists/viatek-export.xml', priceList, 'utf8')
}

const storePriceList = async (priceList) => {
  await fs.writeFile('uploads/price-lists/viatek-temp.json', JSON.stringify(priceList), 'utf8')
}

// Manipulate price-list

const priceListXMLToObject = (priceList) => {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '$attr_',
    cdataPropName: '$cdata',
    textNodeName: '$value',
    alwaysCreateTextNode: true,
  })

  return parser.parse(priceList)
}

const filterPriceList = (priceList) => {
  const result = cloneDeep(priceList)

  result.shop.categories.category = result.shop.categories.category.filter(({ $attr_id: id }) =>
    CATEGORIES_TO_PARSE.includes(Number(id)) || SUBCATEGORIES_TO_PARSE.includes(Number(id)))

  result.shop.offers.offer = result.shop.offers.offer.filter(({ categoryId: { $value: categoryId } }) => CATEGORIES_TO_PARSE.includes(Number(categoryId)) || SUBCATEGORIES_TO_PARSE.includes(Number(categoryId)))

  return result
}

const priceListObjectToXML = (priceList) => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '$attr_',
    cdataPropName: '$cdata',
    textNodeName: '$value',
    suppressBooleanAttributes: false,
    format: true,
  })

  return builder.build(priceList)
}

// Validation

const validatePriceList = (priceList) => ({
  errors: {
    categories: validateCategories(priceList.shop.categories.category),
    products: validateProducts(priceList.shop.offers.offer),
  },
  get isValid () {
    return !this.errors.categories.length && !this.errors.products.length
  },
})

const validateCategories = (categories) =>
  categories.reduce((acc, category) => {
    const categoryValidationResult = CATEGORY_PROPERTIES_TO_VALIDATE.reduce((categoryValidationAcc, property) => {
      const validatedValue = getNestedProperty(category, property)

      const forbiddenWords = findForbiddenWords(validatedValue)

      if (forbiddenWords.length) {
        categoryValidationAcc.errors.push({
          property,
          type: 'forbiddenWords',
          text: `Used forbidden words in ${property}`,
          forbiddenWords,
        })
      }

      return categoryValidationAcc
    }, {
      category,
      text: 'Invalid category',
      errors: [],
    })

    if (categoryValidationResult.errors.length) acc.push(categoryValidationResult)

    return acc
  }, [])

const validateProducts = (products) =>
  products.reduce((acc, product) => {
    const productValidationResult = PRODUCT_PROPERTIES_TO_VALIDATE.reduce((productValidationAcc, property) => {
      const validatedValue = getNestedProperty(product, property)

      const forbiddenWords = findForbiddenWords(validatedValue)

      if (forbiddenWords.length) {
        productValidationAcc.errors.push({
          property,
          type: 'forbiddenWords',
          text: `Used forbidden words in ${property}`,
          forbiddenWords,
        })
      }

      return productValidationAcc
    }, {
      product,
      text: 'Invalid product',
      errors: [],
    })

    if (productValidationResult.errors.length) acc.push(productValidationResult)

    return acc
  }, [])

const findForbiddenWords = (string) =>
  FORBIDDEN_WORDS.filter((forbiddenWord) => string.toLowerCase().includes(forbiddenWord.word))

// Fix validation errors

const fixValidationErrors = (priceList, errors) => {
  const result = cloneDeep(priceList)

  if (errors.categories.length) result.shop.categories.category = fixValidationErrorsCategories(result.shop.categories.category, errors.categories)

  if (errors.products.length) result.shop.offers.offer = fixValidationErrorsProducts(result.shop.offers.offer, errors.products)

  return result
}

const fixValidationErrorsCategories = (categories, errors) => {
  const errorsObject = errors.reduce((acc, error) => {
    acc[error.category.$attr_id] = error

    return acc
  }, {})

  return categories.map((category) => {
    const categoryErrors = errorsObject[category.$attr_id]

    if (!categoryErrors) return category

    let result = cloneDeep(category)

    categoryErrors.errors.forEach((categoryError) => {
      const { property, type, forbiddenWords } = categoryError

      if (type === 'forbiddenWords') {
        const invalidValue = getNestedProperty(category, property)

        const fixedValue = replaceForbiddenWords(invalidValue, forbiddenWords)

        result = setNestedProperty(result, property, fixedValue)
      }
    })

    return result
  })
}

const fixValidationErrorsProducts = (products, errors) => {
  const errorsObject = errors.reduce((acc, error) => {
    acc[error.product.$attr_id] = error

    return acc
  }, {})

  return products.map((product) => {
    const productErrors = errorsObject[product.$attr_id]

    if (!productErrors) return product

    let result = cloneDeep(product)

    productErrors.errors.forEach((productError) => {
      const { property, type, forbiddenWords } = productError

      if (type === 'forbiddenWords') {
        const invalidValue = getNestedProperty(product, property)

        const fixedValue = replaceForbiddenWords(invalidValue, forbiddenWords)

        result = setNestedProperty(result, property, fixedValue)
      }
    })

    return result
  })
}

const replaceForbiddenWords = (string, forbiddenWords) => {
  const replaceMultipleMap = forbiddenWords.reduce((acc, forbiddenWord) => {
    const { word, replacements } = forbiddenWord

    acc[word] = replacements[0]

    return acc
  }, {})

  return replaceMultiple(string, replaceMultipleMap)
}

// ==================================================
// Interfaces
// ==================================================

export const get = async (req, res) => {
  try {
    const { query: { refreshPriceListProvider, autofixValidation } } = req

    if (refreshPriceListProvider) await refreshPriceListProviderXML()

    const priceListProviderXML = await readPriceListProviderXML()

    const priceListProvider = priceListXMLToObject(priceListProviderXML)

    const priceList = filterPriceList(priceListProvider)

    await storePriceList(priceList)

    const { isValid, errors } = validatePriceList(priceList)

    if (!isValid && !autofixValidation) {
      const autofixed = fixValidationErrors(priceList, errors)

      res.status(400).json({
        message: 'Validation error',
        errors,
        autofixed,
      })

      return
    }

    const validatedPriceList = isValid ? priceList : fixValidationErrors(priceList, errors)

    const priceListXML = priceListObjectToXML(validatedPriceList)

    await storePriceListXML(priceListXML)

    res.json(priceListXML)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to get price list' })
  }
}
