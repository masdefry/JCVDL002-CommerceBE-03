const express = require("express");
const routers = express.Router();
const cartController = require("../Controllers/cartController");

const jwtVerify = require("./../Middleware/JWTVerify");

routers.get("/", jwtVerify, cartController.getCart);
routers.post("/", jwtVerify, cartController.addToCart);
routers.patch("/:id", cartController.editCart);
routers.delete("/:id", cartController.deleteCart);

module.exports = routers;
