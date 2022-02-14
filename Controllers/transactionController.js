const { get } = require("express/lib/response");
const util = require("util");

// Import connection
const db = require("../Database/Connection");

let query = util.promisify(db.query).bind(db);

const addTransaction = async (req, res) => {
  /* req.body = {
        cart: {
            id,
            productName,
            qty,
            price,
            idProduct
        },
        totalProductPrice,
        shipping,
        totalPrice,
        addressId,
        warehouseId
        }
  */
  let data = req.body;

  // Ambil stok produk dari warehouse
  let scriptQuery = `SELECT stock from product_stock WHERE id_product = ? and warehouse_id = ?`;

  // Kurangi stok produk dari warehouse
  let scriptQuery1 = `UPDATE product_stock SET stock = ? WHERE id_product = ? and warehouse_id = ?`;

  // Insert ke table transaction (total_product_price, shipping_cost, total_price, user_id, address_id, expired_date, warehouse_id)
  let scriptQuery2 = `INSERT INTO transaction SET ?`;

  // Insert ke table transaction_details (product_name, product_qty, price, transaction_id)
  let scriptQuery3 = `INSERT INTO transaction_details SET ?`;

  // Insert ke table transaction_status (transaction_id, transaction_date, status_id)
  let scriptQuery4 = `INSERT INTO transaction_status SET ?`;

  // Ambil data stock dari tabel produk
  let scriptQuery6 = `SELECT stock FROM product WHERE id = ?`;

  // Kurangi stock dari tabel product
  let scriptQuery7 = `UPDATE product SET stock = ? WHERE id = ?`;

  const dt = new Date();
  dt.setTime(dt.getTime() + 24 * 60 * 60 * 1000);
  console.log(dt);

  try {
    // Data untuk di insert ke table transaction
    let dataToSend = {
      total_product_price: data.totalProductPrice,
      shipping_cost: data.shipping,
      total_price: data.totalPrice,
      user_id: req.user.id,
      address_id: data.addressId,
      expired_date: dt,
      warehouse_id: data.warehouseId,
    };
    console.log("dataToSend:", dataToSend);

    await query("Start Transaction");

    // Loop untuk mengurangi stok produk di warehouse dan hapus data cart dari table
    for (let i = 0; i < data.cart.length; i++) {
      // // Ambil stok produk di warehouse
      // let getWarehouseStock = await query(scriptQuery, [
      //   data.cart[i].id_produk,
      //   data.warehouseId,
      // ]);
      // console.log("getWarehouseStock:", getWarehouseStock);
      // console.log("cartQty", data.cart[i]);

      // // Jika stock produk di warehouse kosong, ambil stok dari warehouse lain
      // if (!getWarehouseStock.length) {
      //   getWarehouseStock = await query(scriptQuery, [
      //     data.cart[i].id_produk,
      //     data.warehouseId + 1,
      //   ]);

      //   data.warehouseId += 1;
      // }

      // // Kurangi stok produk di table warehouse
      // let updateWarehouseStock = await query(scriptQuery1, [
      //   getWarehouseStock[0].stock - data.cart[i].qty,
      //   data.cart[i].id_produk,
      //   data.warehouseId,
      // ]).catch((err) => {
      //   throw err;
      // });

      // Ambil stock produk dari table produk
      let getProductStock = await query(scriptQuery6, [data.cart[i].id_produk]);

      // Kurangi stok produk di tabel product
      let updateProductStock = await query(scriptQuery7, [
        getProductStock[0].stock - data.cart[i].qty,
        data.cart[i].id_produk,
      ]).catch((err) => {
        throw err;
      });
    }

    // Insert ke table transaction
    let addTransactionData = await query(scriptQuery2, dataToSend).catch(
      (err) => {
        throw err;
      }
    );

    console.log(addTransactionData.insertId);

    // Loop untuk insert data produk ke transaction detail
    for (let i = 0; i < data.cart.length; i++) {
      // Data untuk di insert ke table transaction detail
      let { product_name, qty, product_price } = data.cart[i];

      let dataToSend1 = {
        product_name: product_name,
        product_qty: qty,
        price: product_price,
        transaction_id: addTransactionData.insertId,
      };

      // Insert ke table transaction detail
      let addTransactionDetail = await query(scriptQuery3, dataToSend1).catch(
        (err) => {
          throw err;
        }
      );
    }

    // Insert ke table transaction status
    let addTransactionStatus = await query(scriptQuery4, {
      transaction_id: addTransactionData.insertId,
      transaction_date: new Date(),
      status_id: 1,
    });

    await query("Commit");
    res.status(200).send({
      message: "Transaction has been added, waiting for payment",
      transaction_id: addTransactionData.insertId,
      status_id: 1,
    });
  } catch (error) {
    await query("Rollback");
    console.log(error);
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const getOngoingTransaction = async (req, res) => {
  // Ambil data transaction user yang menunggu verifikasi
  let scriptQuery = `SELECT ts.id, total_price, t.id as transaction_id, transaction_date, proof FROM transaction t JOIN transaction_status ts ON t.id = ts.transaction_id 
  JOIN payment_proof p ON p.transaction_id = t.id WHERE ts.status_id = 2`;

  try {
    let getOngoingData = await query(scriptQuery).catch((err) => {
      throw err;
    });

    res.status(200).send({
      data: [...getOngoingData],
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const getOngoingTransactionUser = async (req, res) => {
  let scriptQuery = `SELECT ts.id, total_price, t.id as transaction_id, transaction_date, proof FROM transaction t JOIN transaction_status ts ON t.id = ts.transaction_id 
  JOIN payment_proof p ON p.transaction_id = t.id WHERE ts.status_id = 2 and t.user_id = ?`;

  let scriptQuery1 = `SELECT td.product_name, product_qty, price FROM transaction_details td JOIN product p ON td.product_name = p.product_name WHERE td.transaction_id = ?`;

  try {
    let getTransactionData = await query(scriptQuery, req.user.id).catch(
      (err) => {
        throw err;
      }
    );

    for (let i = 0; i < getTransactionData.length; i++) {
      let getTransactionDetail = await query(
        scriptQuery1,
        getTransactionData[i].transaction_id
      ).catch((err) => {
        throw err;
      });
      getTransactionData[i].transaction_detail = getTransactionDetail;
    }

    res.status(200).send({
      data: getTransactionData,
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  let { transaction_id, status_id, id } = req.body;

  // Jika payment di accept atau ditolak
  let scriptQuery = `INSERT INTO transaction_status SET ?`;

  // Hapus transaction status menunggu verifikasi
  let scriptQuery1 = `DELETE FROM transaction_status WHERE id = ?`;

  const d = new Date();

  try {
    let insertTransactionStatus = await query(scriptQuery, {
      transaction_id,
      status_id,
      transaction_date: new Date(),
    }).catch((err) => {
      throw err;
    });

    let deteleTransactionStatus = await query(scriptQuery1, id).catch((err) => {
      throw err;
    });

    res.status(200).send({
      message: "Payment verification success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const getTransactionUser = async (req, res) => {
  let scriptQuery = `SELECT t.id, total_product_price, shipping_cost, total_price, transaction_date FROM transaction t JOIN transaction_status ts ON t.id = ts.transaction_id WHERE user_id = ? AND ts.status_id = 3`;

  let scriptQuery1 = `SELECT td.product_name, product_qty, price FROM transaction_details td JOIN product p ON td.product_name = p.product_name WHERE td.transaction_id = ?`;

  try {
    let getTransactionData = await query(scriptQuery, req.user.id).catch(
      (err) => {
        throw err;
      }
    );

    for (let i = 0; i < getTransactionData.length; i++) {
      let getTransactionDetail = await query(
        scriptQuery1,
        getTransactionData[i].id
      ).catch((err) => {
        throw err;
      });
      getTransactionData[i].transaction_detail = getTransactionDetail;
    }

    res.status(200).send({
      data: getTransactionData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};
module.exports = {
  addTransaction,
  getTransactionUser,
  getOngoingTransaction,
  verifyPayment,
  getOngoingTransactionUser,
};
