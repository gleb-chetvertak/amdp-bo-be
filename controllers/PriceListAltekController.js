// TODO: Создать категории, для каждой прописать комиссии

import xlsx from 'node-xlsx'
import { promises as fs } from 'fs'
import { createRequire } from 'module'

import { USD_TO_UAH_RATE } from '../constants/index.js'

const require = createRequire(import.meta.url)
const priceListConfigExcel = require('../database/price-lists-configs/altekExcel.json')

// ==================================================
// Helpers
// ==================================================

const getQuantity = ({ product, quantityIndex, providerSupplyDateKey }) => {
  const quantityRaw = String(product[quantityIndex])

  if (quantityRaw.startsWith(providerSupplyDateKey)) return 0

  return Number(quantityRaw.replace(/[^0-9]/g, '')) || 0
}

const getSupplyDate = ({ product, quantityIndex, providerSupplyDateKey, providerSupplyDateSubstring }) => {
  const quantityRaw = String(product[quantityIndex])

  if (!quantityRaw.includes(providerSupplyDateKey)) return undefined

  return quantityRaw.substring(...providerSupplyDateSubstring)
}

// ==================================================
// Business logic
// ==================================================

const parsePriceList = (url) => {
  const { onDemandKey: providerOnDemandKey, supplyDateKey: providerSupplyDateKey, supplyDateSubstring: providerSupplyDateSubstring, startWorksheet, worksheetsAllowedToParse, worksheets } = priceListConfigExcel

  const workSheetsFromFile = xlsx.parse(`${process.env.PWD}${url}`)

  workSheetsFromFile.splice(0, startWorksheet)

  const groups = new Set()

  const products = workSheetsFromFile.flatMap(({ name, data }) => {
    if (!worksheetsAllowedToParse[name] || !worksheets[name]) return []

    const { code: codeIndex, group: groupIndex, priceDealer: priceDealerIndex, priceSuggest: priceSuggestIndex, quantity: quantityIndex, title: titleIndex } = priceListConfigExcel.worksheets[name]

    return data.filter((line) => typeof line[1] === 'number').map((product) => {
      const categoryFull = `${name} --- ${product[groupIndex] || name}`
      groups.add(categoryFull)

      return {
        category: name,
        code: String(product[codeIndex]),
        group: product[groupIndex],
        categoryFull,
        isOnDemand: product[quantityIndex] === providerOnDemandKey,
        priceDealer: Math.ceil(product[priceDealerIndex] * USD_TO_UAH_RATE),
        priceSuggest: Math.floor(product[priceSuggestIndex] * USD_TO_UAH_RATE),
        quantity: getQuantity({ product, quantityIndex, providerSupplyDateKey }),
        quantityRaw: String(product[quantityIndex]),
        supplyDate: getSupplyDate({ product, quantityIndex, providerSupplyDateKey, providerSupplyDateSubstring }),
        title: product[titleIndex],
      }
    })
  })

  return { products, groups: Array.from(groups) }
}

const storePriceList = async (priceList) => {
  await fs.writeFile('database/price-lists/altek.json', JSON.stringify(priceList), 'utf8')
}

const readPriceList = async () => {
  const priceList = await fs.readFile('database/price-lists/altek.json', 'utf8', (err, data) => {
    if (err) throw err

    return data
  })

  return JSON.parse(priceList)
}

// ==================================================
// Interfaces
// ==================================================

export const create = async (req, res) => {
  try {
    const { file } = req

    const url = `/uploads/price-lists/${file.originalname}`

    const priceList = parsePriceList(url)

    await storePriceList(priceList)

    res.json(priceList)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to parse price list' })
  }
}

export const get = async (req, res) => {
  try {
    const priceList = await readPriceList()

    res.json(priceList)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to get price list' })
  }
}
