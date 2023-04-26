import express from 'express'
import mongoose from 'mongoose'

// App
const app = express()

// Database
mongoose.connect('mongodb://127.0.0.1:27017/todo', { useNewUrlParser: true })

const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  // we're connected!
  console.log('Connected to database')
})

//Schema
const reviewSchema = new mongoose.Schema({
  userName: String,
  text: String,
})

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
})

const Product = mongoose.model('Product', productSchema)

const Review = mongoose.model('Review', reviewSchema)

app.use(express.json())

// Create a product
app.post('/products', async (req, res) => {
  const { name, price, description } = req.body
  const product = new Product({ name, price, description })
  await product.save()
  res.send(product)
})

// Get all products
app.get('/products', async (req, res) => {
  const products = await Product.find({})
  res.send(products)
})

// Get a product
app.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id)
  res.send(product)
})

// Create a review
app.post('/products/:id/reviews', async (req, res) => {
  const product = await Product.findById(req.params.id)
  const { userName, text } = req.body
  const review = new Review({ userName, text })
  product.reviews.push(review)
  await review.save()
  await product.save()
  res.send(review)
})

// Get all reviews for a product
app.get('/products/:id/reviews', async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews')
  res.send(product)
});

app.listen(3000, () => console.log('Server started'))
