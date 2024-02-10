// import PostModel from '../models/Post.js'

export const create = async (req, res) => {
  try {
    const { title, text, tags, imageUrl } = req.body

    const doc = new PostModel({
      title,
      text,
      tags,
      imageUrl,
      user: req.userId,
    })

    const post = await doc.save()

    res.json(post)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to create post' })
  }
}

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec()

    res.json(posts)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to find posts' })
  }
}

export const getOne = async (req, res) => {
  const { id } = req.params

  try {
    const post = await PostModel.findByIdAndUpdate(id, {
      $inc: { viewsCount: 1 },
    }, {
      new: true,
    }).populate('user').exec()

    if (!post) return res.status(404).json({ message: 'Could not find post' })

    res.json(post)
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to find posts' })
  }
}

export const update = async (req, res) => {
  try {
    const { id } = req.params

    const { title, text, tags, imageUrl } = req.body

    await PostModel.updateOne({
      _id: id,
    }, {
      title,
      text,
      tags,
      imageUrl,
    })

    res.json({ success: true })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to update post' })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params

    const post = await PostModel.findByIdAndDelete(id)

    if (!post) return res.status(404).json({ message: 'Could not find post' })

    res.json({ success: true })
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: 'Failed to delete post' })
  }
}
