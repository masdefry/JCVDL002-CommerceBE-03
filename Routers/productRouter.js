const express = require('express')
const { productController } = require('../Controllers')
const routers = express.Router()

routers.get('/get', productController.getData),
routers.post('/add-product', productController.addData),
routers.patch('/edit-product/id', productController.editData),
routers.delete('/delete-product/id', productController.deleteData)

module.exports = routers