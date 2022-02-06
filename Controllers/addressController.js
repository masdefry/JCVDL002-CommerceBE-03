const util = require("util");

// Import connection
const db = require("../Database/Connection");

let query = util.promisify(db.query).bind(db);

const getAddress = async (req, res) => {
  let scriptQuery = `SELECT a.id, address, postal_code, status FROM address a JOIN user u ON a.user_id = u.id WHERE u.id = ?`;

  try {
    let getUserAddress = await query(scriptQuery, req.user.id).catch((err) => {
      throw err;
    });

    res.status(200).send({
      data: getUserAddress,
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const inputAddress = async (req, res) => {
  let data = req.body;

  let scriptQuery = `INSERT INTO address SET ?`;

  let dataToSend = {
    address: data.address,
    postal_code: data.postal_code,
    user_id: req.user.id,
    status: data.status,
  };

  try {
    let inputUserAddress = await query(scriptQuery, dataToSend).catch((err) => {
      throw err;
    });
    res.status(200).send({
      message: "Address has been added to database",
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const setDefaultAddress = async (req, res) => {
  // Merubah status default address jadi bukan default
  let scriptQuery1 = `UPDATE address SET status = 0 WHERE user_id = ? and status = 1`;
  // Merubah address yang dipilih menjadi default address
  let scriptQuery2 = `UPDATE address SET status = 1 WHERE id = ?`;

  try {
    let resetDefault = await query(scriptQuery1, req.user.id).catch((err) => {
      throw err;
    });

    let newDefaultAddress = await query(scriptQuery2, req.params.id).catch(
      (err) => {
        throw err;
      }
    );

    res.status(200).send({
      message: "Address has been successfully set to default",
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

module.exports = { getAddress, inputAddress, setDefaultAddress };
