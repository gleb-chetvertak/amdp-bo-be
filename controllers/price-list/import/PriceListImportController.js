// Manipulates only viatek price lists:
// 1. Upload provider's price list, store it as it is
// 2. Fetch provider's price list, store it as it is
// 3. Transform provider's price list into json

// TODO: Create endpoint to watch edit configs

// ==================================================
// Interfaces
// ==================================================

export const fetchFromRemote = async (req, res) => {
  try {
    // const { query: { provider } } = req

    // Errors:
    // - no provider
    // - invalid provider
    // - no url in config
    // - couldn't fetch
    // - fetched invalid file
    // - couldn't transform
    // Success:
    // - store to uploads/price-lists/viatek.hash.fileType

    res.json({ success: true })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: '' })
  }
}

export const upload = async (req, res) => {
  try {
    // const { body: { file }, query: { provider } } = req

    // if (fetch) Need to fetch using url from config. Validate fetched data
    // Errors:
    // - no provider
    // - no file
    // - invalid provider
    // - provided invalid file
    // - couldn't transform
    // Success:
    // - store to uploads/price-lists/viatek.hash.fileType

    res.json({ success: true })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: '' })
  }
}

export const getOriginal = async (req, res) => {
  try {
    // const { query: { provider } } = req

    // Errors:
    // - no provider
    // - invalid provider
    // - couldn't find price-list
    // Success:
    // - send original price-list

    res.json({ success: true })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: '' })
  }
}

export const getTransformed = async (req, res) => {
  try {
    // const { query: { provider } } = req

    // Errors:
    // - no provider
    // - invalid provider
    // - couldn't find price-list
    // Success:
    // - send transformed price-list

    res.json({ success: true })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: '' })
  }
}
