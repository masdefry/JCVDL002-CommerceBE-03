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

  // Cek apakah produk sudah ada di cart
  let scriptQuery = `SELECT id, qty FROM cart WHERE id_produk = ? AND user_id = ?`;

  // Jika produk sudah ada di cart, maka tambahkan qty
  let scriptQuery1 = `UPDATE cart SET qty = ? WHERE id = ?`;

  // Jika produk tidak ada di cart, maka tambahkan produk
  let scriptQuery2 = `INSERT INTO cart SET ?`;

  try {
    let { qty, product_id } = data;

    const findCartData = await query(scriptQuery, [
      product_id,
      req.user.id,
    ]).catch((err) => {
      throw err;
    });

    if (findCartData.length) {
      let editCartQty = await query(scriptQuery1, [
        findCartData[0].qty + qty,
        findCartData[0].id,
      ]).catch((err) => {
        throw err;
      });

      res.status(200).send({
        message: "Item has been added to cart",
      });
    } else {
      let dataToSend = {
        qty: qty,
        user_id: req.user.id,
        id_produk: product_id,
      };

      const addCartData = await query(scriptQuery2, dataToSend).catch((err) => {
        throw err;
      });

      res.status(200).send({
        message: "Item has been added to cart",
      });
    }
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
  deleteCart,
};
