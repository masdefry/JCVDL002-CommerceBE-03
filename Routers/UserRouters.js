const express = require("express");
const routers = express.Router();
const userControllers = require("../Controllers/userControllers");

const jwtVerify = require("./../Middleware/JWTVerify");

routers.post("/login", userControllers.login);
routers.post("/register", userControllers.register);
routers.patch("/verification", jwtVerify, userControllers.verify);
routers.patch("/change-password", jwtVerify, userControllers.changePassword);
routers.patch("/forget-password", userControllers.forgetPassword);

module.exports = routers;
