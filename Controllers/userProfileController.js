const util = require("util");

// Import connection
const db = require("../Database/Connection");

let query = util.promisify(db.query).bind(db);

const getUserProfile = async (req, res) => {
  const scriptQuery = `SELECTSELECT username, email, phone, verification_status, first_name, last_name, birthdate, 
gender, role FROM user u JOIN user_role ur ON u.user_role_id = ur.id
JOIN user_profile up ON u.id = up.user_WHERE u.id = ?`;

  try {
    await query("Start Transaction");
    const getUserData = await query(scriptQuery, req.user.id).catch((err) => {
      throw err;
    });

    let {
      username,
      email,
      phone,
      verification_status,
      first_name,
      last_name,
      birthdate,
      gender,
      user_role_id,
    } = getUserData[0];

    await query("Commit");
    res.status(200).send({
      error: false,
      message: "Get data user profile success",
      data: {
        username,
        email,
        phone,
        verification_status,
        first_name,
        last_name,
        birthdate,
        gender,
        user_role_id,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const inputUserProfile = async (req, res) => {
  const data = req.body;
  const userId = req.user.id;

  const scriptQuery = `INSERT INTO user_profile (first_name, last_name, birthdate, profile_picture, user_id, gender) VALUES (?, ?, ?, ?, ?, ?)`;

  try {
    await query("Start Transaction");
    const addUserProfile = await query(scriptQuery, [
      data.firstName,
      data.lastName,
      data.birthdate,
      data.profilePicture,
      userId,
      data.gender,
    ]).catch((err) => {
      throw err;
    });

    let { first_name, last_name, birthdate, gender, user_role_id } =
      addUserProfile[0];

    await query("Commit");
    res.status(200).send({
      error: false,
      message: "Add user profile success",
      detail: "You have successfully input your user profile",
      data: {
        first_name,
        last_name,
        birthdate,
        gender,
        user_role_id,
        profile_picture,
      },
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

module.exports = {
  getUserProfile,
  inputUserProfile,
};
