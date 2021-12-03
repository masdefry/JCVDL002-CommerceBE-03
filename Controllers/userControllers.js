// Import connection
const db = require("../Database/Connection");

// Import hashPassword
const hashPassword = require("../Helpers/Hash");

const { createToken } = require("../Helpers/JWTSign");

module.exports = {
  login: (req, res) => {
    // Ambil data yang dikirim oleh user
    let data = req.body;

    // Hash password
    data.password = hashPassword(data.password);

    // Cek usernama dan password sudah terdaftar atau belum
    let scriptQuery = `SELECT * from user WHERE username = ${db.escape(
      data.username
    )} and password = ${db.escape(data.password)}`;

    db.query(scriptQuery, (err, result) => {
      if (err) res.status(500).send(err);
      if (result[0]) {
        let {
          id,
          username,
          email,
          password,
          user_role_id,
          verification_status,
        } = result[0];

        let token = createToken({
          id,
          username,
          email,
          password,
          user_role_id,
        });

        if (verification_status == 0) {
          res
            .status(200)
            .send({ message: `Your account has not been verified` });
        } else {
          res.status(200).send({
            dataLogin: result[0],
            token,
            message: `You've been logged in successfully`,
          });
        }
      }
    });
  },
};
