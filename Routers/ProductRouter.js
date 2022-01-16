const express = require("express");
const routers = express.Router();
const productController = require("../Controllers/productController");

routers.get("/", productController.getProducts);
routers.get("/:id", productController.getProductById);

module.exports = routers;
