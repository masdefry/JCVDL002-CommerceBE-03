const express = require("express");
const routers = express.Router();

const transactionController = require('../Controllers/transactionController')

const jwtVerify = require("./../Middleware/JWTVerify");

routers.post("/", jwtVerify, transactionController.addTransaction)

module.exports = routers;