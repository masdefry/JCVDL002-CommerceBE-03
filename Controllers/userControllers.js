const util = require("util");

// Import connection
const db = require("../Database/Connection");

let transporter = require("../Helpers/Nodemailer");
let query = util.promisify(db.query).bind(db);
const dateTime = require("../Helpers/DateTime");
require("dotenv").config();

// Import hashPassword
const hashPassword = require("./../Helpers/Hash");

// Import create token
const createToken = require("./../Helpers/JWTSign");

const login = async (req, res) => {
  // Ambil data yang dikirim oleh user
  let data = req.body;
  console.log(data);

  // Hash password
  data.password = hashPassword(data.password);

  // Cek usernama dan password sudah terdaftar atau belum
  let scriptQuery = `SELECT * from user WHERE username = ? and password = ?`;

  try {
    let getUserLogin = await query(scriptQuery, [
      data.username,
      data.password,
    ]).catch((error) => {
      throw error;
    });
    console.log(getUserLogin);

    if (getUserLogin.length == 0) {
      throw {
        status: 400,
        message: "Error username or password",
        detail: "Your password and username does not match",
      };
    }

    if (getUserLogin[0].verification_status === 0) {
      throw {
        status: 400,
        message: "Account not verified",
        detail:
          "Your account has not been verified, please check your email and verify your account",
      };
    }

    let { id, username, email, user_role_id } = getUserLogin;

    await query("Start Transaction");

    let token = createToken({
      id,
      username,
      email,
      user_role_id,
    });

    await query("Commit");
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
      from: `Admin ${process.env.USER_EMAIL}`,
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
  let { id, username, email, user_role_id } = req.user;

  let updateQuery = `UPDATE user SET verification_status = 1 WHERE id = ${db.escape(
    id
  )}`;

  db.query(updateQuery, (err, result) => {
    if (err) res.status(500).send(err);

    let token = createToken({
      id,
      username,
      email,
      user_role_id,
    });

    res.status(200).send({
      message: "Your account has been verified",
      success: true,
      token,
    });
  });
};

const changePassword = async (req, res) => {
  let password = req.body.password;

  let query1 = "UPDATE user SET password = ? WHERE id = ?";

  password = hashPassword(password);
  await query("Start Transaction");
  try {
    let updateUserData = await query(query1, [password, req.user.id]).catch(
      (error) => {
        throw error;
      }
    );
    await query("Commit");
    res.status(200).send({
      error: false,
      message: "Change Password Success",
      data: {
        id: req.user.id,
        email: req.user.email,
        user_role_id: req.user.user_role_id,
      },
    });
  } catch (error) {
    console.log(error);
    if (error.status) {
      res.status(error.status).send({
        error: true,
        message: error.message,
        detail: error.detail,
      });
    } else {
      res.status(500).send({
        error: true,
        message: error.message,
      });
    }
  }
};

const forgetPassword = async (req, res) => {
  let query1 = `SELECT * FROM user WHERE email = ?`;

  try {
    let getUserData = await query(query1, req.body.email).catch((error) => {
      throw error;
    });

    if (getUserData.length == 0) {
      throw {
        status: 400,
        message: "Error",
        detail: "Email is not valid or has not been registered",
      };
    }

    await query("Start Transaction");

    let { id, username, email, user_role_id } = getUserData[0];

    let token = createToken({
      id,
      username,
      email,
      user_role_id,
    });

    // Konfigurasi untuk kirim email lupa password
    let mail = {
      from: `Admin ${process.env.USER_EMAIL}`,
      to: `${getUserData[0].email}`,
      subject: `Change Password`,
      html: `<a href='http://localhost:3000/change-password/${token}'>Click here to change your current password</a>`,
    };

    // Kirim email ganti password
    transporter.sendMail(mail, (errMail, resMail) => {
      if (errMail) {
        res.status(500).send({
          message: "Reset password failed",
          success: false,
          err: errMail,
        });
      }
    });

    await query("Commit");
    res.status(200).send({
      error: false,
      message: "Email Sent",
      detail:
        "Email has been sent, please check your email and click the link attached to reset your password",
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).send({
        error: true,
        message: error.message,
        detail: error.detail,
      });
    } else {
      res.status(500).send({
        error: true,
        message: error.message,
      });
    }
  }
};

module.exports = { login, register, verify, changePassword, forgetPassword };
