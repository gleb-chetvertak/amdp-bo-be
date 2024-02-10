// TODO: Удалить из гугл диска пустые файлы, загрузить не пустые, если есть
// TODO: Переименовать все файлы остатков вольтера на гугл диске, чтоб остались только даты, в формате год-месяц-день (2 файла уже переименованы)
// TODO: Скачать все файфлы и сохранить их в этом проекте в папку 'uploads/volter-history'
// TODO: Добавить парсеры для всех файлов (по аналогии с rawPriceList1, rawPriceList2) в функцию и в return функции. Добавлять в порядке возрастания даты,
// при необходимости добавить парсеры перед уже созданными (например, добавить rawPriceList1 для файла 2024-01-01.xls, rawPriceList1 сделать rawPriceList2, а rawPriceList2 - rawPriceList3)
// TODO: Рефакторинг: создать константу priceLists (массив), в которую добавить все ссылки на прайс-листы), и создавать result не тупым вписыванием названий, а создавать массив result, проходясь
// методом Array.map() по массиву priceLists - на каждой итерации коллбек должен брать ссылку из массива и подставлять ее в парсер, возвращая результат
// TODO: В результат сейчас попадают вложенные массивы (результат выглядит как [[{ prop1: 'value1', prop2: 'value2' }], [{ prop1: 'value1', prop2: 'value2' }]]). Убрать лишнюю вложенность, сделав
// двумерный массив одномерным массивом объектов ([{ prop1: 'value1', prop2: 'value2' }, { prop1: 'value1', prop2: 'value2' }]). Сначала так, как у тебя получится - найди решение сам. Потом
// напиши мне - я скажу, какие еще методы попробовать. Свое решение не удаляй, а просто закомментирую всю функцию getPriceObject и ниже ее продублируй с новым решением.
// TODO: Сейчас каждый объект содержит свойства name и data. В результате name заменяй на урл, по которому лежит єтот файл (брать из ранее созданного массива, по которому идет Array.map())

import xlsx from 'node-xlsx'

// ==================================================
// Business logic
// ==================================================

const parsedPriceLists = () => {
  const rawPriceList1 = xlsx.parse(`${process.env.PWD}/uploads/volter-history/2024-01-02.xls`)
  const rawPriceList2 = xlsx.parse(`${process.env.PWD}/uploads/volter-history/2024-01-19.xls`)

  const result = [rawPriceList1, rawPriceList2]

  return result
}

// ==================================================
// Interfaces

export const get = async (req, res) => {
  try {
    const result = parsedPriceLists()

    res.json(result)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Request failed' })
  }
}
