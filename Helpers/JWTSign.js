const jwt = require("jsonwebtoken");

// Import .env
require("dotenv").config();

const createToken = (payload) => {
  console.log("test jwt");
  return jwt.sign(payload, process.env.JWT_SECRETKEY, {
    expiresIn: "24h",
  });
};

module.exports = createToken;
