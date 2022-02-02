const express = require("express");
const routers = express.Router();
const productController = require("../Controllers/productController");

routers.get("/", productController.getProducts);
routers.get("/:id", productController.getProductById);
routers.post("/", productController.addProduct);
routers.patch("/:id", productController.editProduct);
routers.delete("/:id", productController.deleteProduct);

module.exports = routers;
