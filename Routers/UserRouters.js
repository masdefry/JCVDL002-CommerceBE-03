const express = require("express");
const routers = express.Router();
const userControllers = require("../Controllers/userControllers");

const jwtVerify = require("./../Middleware/JWTVerify");

routers.post("/login", userControllers.login);
routers.post("/register", userControllers.register);
routers.patch("/verification", jwtVerify, userControllers.verify);

module.exports = routers;
