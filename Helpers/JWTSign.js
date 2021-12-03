const jwt = require("jsonwebtoken");

// Import .env
require("dotenv").config();

module.exports = {
  createToken: (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRETKEY, {
      expiresIn: "24h",
    });
  },
};
