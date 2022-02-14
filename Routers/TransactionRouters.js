const express = require("express");
const routers = express.Router();

const transactionController = require("../Controllers/transactionController");

const jwtVerify = require("./../Middleware/JWTVerify");

routers.post("/", jwtVerify, transactionController.addTransaction);
routers.get("/", jwtVerify, transactionController.getTransactionUser);
routers.get("/ongoing", transactionController.getOngoingTransaction);
routers.post("/verify", transactionController.verifyPayment);
routers.get(
  "/ongoing/user",
  jwtVerify,
  transactionController.getOngoingTransactionUser
);

module.exports = routers;
