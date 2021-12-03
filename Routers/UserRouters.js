const express = require("express");
const routers = express.Router();
const userControllers = require("../Controllers/userControllers");

const jwtVerify = require("./../Middleware/JWTVerify");

routers.post("/login", userControllers.login);

module.exports = routers;
