const express = require("express");
const uploaderController = require("../Controllers/uploaderController");
const routers = express.Router();

const jwtVerify = require("./../Middleware/JWTVerify");

routers.post("/payment", jwtVerify, uploaderController.uploadPayment);

module.exports = routers;
