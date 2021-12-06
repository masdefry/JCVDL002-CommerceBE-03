const express = require('express')
const cors = require('cors')

const PORT = 2003
const app = express()

app.use(cors())
app.use(express.json())

const { productRouter } = require('./Routers')

app.use('/product', productRouter)

app.listen(PORT, () => console.log('api running :', PORT))