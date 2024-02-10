import cloneDeep from 'lodash/cloneDeep.js'

export const replaceMultiple = (string, mapObj) => {
  const re = new RegExp(Object.keys(mapObj).join('|'), 'gi')

  return string.replace(re, (matched) => mapObj[matched.toLowerCase()])
}

export const getNestedProperty = (object, path) => path.split('.').reduce((acc, key) => acc?.[key], object)

export const setNestedProperty = (object, path, value) => {
  const objectCloned = cloneDeep(object)
  let schema = objectCloned
  const pathArray = path.split('.')

  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i]

    if (!schema[key]) schema[key] = {}

    schema = schema[key]
  }

  schema[pathArray[pathArray.length - 1]] = value

  return objectCloned
}
