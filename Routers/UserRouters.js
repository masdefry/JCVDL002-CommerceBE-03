const express = require("express");
const routers = express.Router();
const userControllers = require("../Controllers/userControllers");
// const userProfileControllers = require("../Controllers/userProfileController");

const jwtVerify = require("./../Middleware/JWTVerify");

routers.get("/", jwtVerify, userControllers.getUser);
// routers.get("/user-profile", jwtVerify, userProfileControllers.getUserProfile);
routers.post("/login", userControllers.login);
routers.post("/register", userControllers.register);
routers.patch("/verification", jwtVerify, userControllers.verify);
routers.patch("/change-password", jwtVerify, userControllers.changePassword);
routers.patch("/forget-password", userControllers.forgetPassword);
routers.patch(
  "/verify-forget-password",
  jwtVerify,
  userControllers.verifyForgetPassword
);

module.exports = routers;
