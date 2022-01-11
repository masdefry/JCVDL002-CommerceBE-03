const util = require("util");

// Import connection
const db = require("../Database/Connection");

let query = util.promisify(db.query).bind(db);

const getCart = async (req, res) => {
  let scriptQuery = `SELECT c.id, qty, product_name, id_produk, product_price, stock, gender, category, image FROM cart c JOIN user u
ON c.user_id = u.id JOIN product p
ON c.id_produk = p.id JOIN gender g
ON p.gender_id = g.id JOIN category cg
ON p.category_id = cg.id JOIN product_image pi
ON p.id = pi.id_product WHERE c.user_id = ? group by p.product_name ;`;

  try {
    let getUserCart = await query(scriptQuery, req.user.id).catch((error) => {
      throw error;
    });

    res.status(200).send({
      cartData: getUserCart,
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const addToCart = async (req, res) => {
  let data = req.body;
  let scriptQuery = `INSERT INTO cart SET ?`;

  try {
    let dataToSend = {
      qty: data.qty,
      user_id: req.user.id,
      id_produk: data.product_id,
    };

    const addCartData = await query(scriptQuery, dataToSend).catch((err) => {
      throw err;
    });

    res.status(200).send({
      message: "Item has been added to cart",
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const editCart = async (req, res) => {
  let data = req.body;
  let scriptQuery = `UPDATE cart SET qty = ? WHERE id = ?`;

  try {
    let editCartData = await query(scriptQuery, [
      data.qty,
      req.params.id,
    ]).catch((err) => {
      throw err;
    });

    res.status(200).send({
      message: "Quantity has been updated",
      qty: data.qty,
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const deleteCart = async (req, res) => {
  let scriptQuery = `DELETE FROM cart WHERE id = ?`;

  try {
    let deleteCartData = await query(scriptQuery, req.params.id).catch(
      (err) => {
        throw err;
      }
    );

    res.status(200).send({
      message: "Item has been removed from cart",
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  editCart,
  deleteCart
};