// Import JWT
const jwt = require("jsonwebtoken");

// Import .env
require("dotenv").config();

const jwtVerify = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token)
    return res.status(406).send({
      error: true,
      message: "Token Not Found",
      detail: "Token Tidak Ditemukan!",
    });

  jwt.verify(token, process.env.JWT_SECRETKEY, (err, dataToken) => {
    try {
      if (err) {
        throw err;
      }

      req.user = dataToken;

      next();
    } catch (error) {
      return res.status(500).send({
        error: true,
        message: error,
      });
    }
  });
};

module.exports = jwtVerify;
