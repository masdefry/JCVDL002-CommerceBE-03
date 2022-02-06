const crypto = require("crypto");

function hashPassword(password) {
  const hmac = crypto.createHmac("sha1", "abc123");

  hmac.update(password);

  let passwordHashed = hmac.digest("hex");

  return passwordHashed;
}

module.exports = hashPassword;
