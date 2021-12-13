const util = require("util");

// Import connection
const db = require("../Database/Connection");

let transporter = require("../Helpers/Nodemailer");
let query = util.promisify(db.query).bind(db);
const dateTime = require("../Helpers/DateTime");

// Import hashPassword
const hashPassword = require("./../Helpers/Hash");

const createToken = require("./../Helpers/JWTSign");

const login = (req, res) => {
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
      let { id, username, email, user_role_id, verification_status } =
        result[0];

      let token = createToken({
        id,
        username,
        email,
        user_role_id,
      });
      console.log(result, token);

      if (verification_status == 0) {
        res.status(200).send({ message: `Your account has not been verified` });
      } else {
        res.status(200).send({
          data: {
            id,
            username,
            email,
            user_role_id,
            token,
          },
          message: `You've been logged in successfully`,
        });
      }
    }
  });
};

const register = async (req, res) => {
  let data = req.body;

  // Cek jika email sudah didaftarkan
  let query1 = "SELECT * FROM user WHERE email = ?";
  // Input data ke db
  let query2 = "INSERT INTO user SET ?";
  // Select data yang sudah di register untuk membuat jwt token
  let query3 = "SELECT * from user WHERE id = ?";

  try {
    // Validasi
    if (!data.username || !data.email || !data.password)
      throw {
        status: 400,
        message: "Error",
        detail: "Data tidak boleh kosong",
      };
    if (data.username.length < 6)
      throw {
        status: 400,
        message: "Error",
        detail: "Username minimal 6 karakter",
      };
    if (data.password.length < 6)
      throw {
        status: 400,
        message: "Error",
        detail: "Password minimal 6 karakter",
      };

    await query("Start Transaction");

    // Cek email jika sudah ada di db
    const checkEmail = await query(query1, data.email).catch((error) => {
      throw error;
    });
    if (checkEmail.length > 0)
      throw {
        status: 400,
        message: "Error Validation",
        detail: "Email Sudah Terdaftar",
      };

    // Hash password
    let passwordHashed = hashPassword(data.password);

    // Data register user yang akan dikirim
    let dataToSend = {
      username: data.username,
      password: passwordHashed,
      email: data.email,
      phone: data.phone,
      registration_date: dateTime(),
      verification_status: 0,
      user_role_id: 3,
    };
    console.log(dataToSend);

    // Input data user ke db
    const registerData = await query(query2, dataToSend).catch((error) => {
      throw error;
    });

    // Ambil kembali data yang sudah di input untuk membuat jwt token
    const getRegisterData = await query(query3, registerData.insertId).catch(
      (error) => {
        throw error;
      }
    );
    console.log(getRegisterData);

    let { id, username, email, user_role_id } = getRegisterData[0];

    let token = createToken({
      id,
      username,
      email,
      user_role_id,
    });

    // Konfigurasi untuk kirim email verifikasi
    let mail = {
      from: `Admin <crimsonlord13@gmail.com`,
      to: `${email}`,
      subject: `Account Verification`,
      html: `<a href='http://localhost:3000/verification/${token}'>Click here to verify your account</a>`,
    };

    // Kirim email verifikasi
    transporter.sendMail(mail, (errMail, resMail) => {
      if (errMail) {
        res.status(500).send({
          message: "Registration failed",
          success: false,
          err: errMail,
        });
      }
    });

    await query("Commit");
    res.status(200).send({
      error: false,
      message: "Register Success",
      detail: "Akun Anda Berhasil Terdaftar!",
      data: {
        id: getRegisterData[0].id,
        username: getRegisterData[0].username,
        email: getRegisterData[0].email,
        token: token,
      },
    });
  } catch (error) {
    await query("Rollback");
    if (error.status) {
      // Error yang dikirim oleh kita
      res.status(error.status).send({
        error: true,
        message: error.message,
        detail: error.detail,
      });
    } else {
      // Error yang dikirim oleh server
      res.status(500).send({
        error: true,
        message: error.message,
      });
    }
  }
};

const verify = (req, res) => {
  console.log(req.dataToken);
  let updateQuery = `UPDATE user SET verification_status = 1 WHERE id = ${db.escape(
    req.dataToken.id
  )}`;

  db.query(updateQuery, (err, result) => {
    if (err) res.status(500).send(err);

    res.status(200).send({
      message: "Your account has been verified",
      success: true,
    });
  });
};

module.exports = { login, register, verify };
