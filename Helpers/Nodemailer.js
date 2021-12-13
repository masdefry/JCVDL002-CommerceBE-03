const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "crimsonlord13@gmail.com",
    pass: "wyaxdxatdfralumg",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
