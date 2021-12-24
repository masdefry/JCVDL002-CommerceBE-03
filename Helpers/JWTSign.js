const jwt = require("jsonwebtoken");

// Import .env
require("dotenv").config();

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRETKEY);
};

module.exports = createToken;
