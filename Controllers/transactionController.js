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

  // Hapus data dari table cart
  let scriptQuery5 = `DELETE FROM cart WHERE id = ?`;

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
      // Ambil stok produk di warehouse
      let getProductStock = await query(scriptQuery, [
        data.cart[i].id_produk,
        data.warehouseId,
      ]);
      console.log("getProductStock:", getProductStock);
      console.log("cartQty", data.cart[i]);

      // Kurangi stok produk di warehouse
      let updateProductStock = await query(scriptQuery1, [
        getProductStock[0].stock - data.cart[i].qty,
        data.cart[i].id_produk,
        data.warehouseId,
      ]).catch((err) => {
        throw err;
      });

      // Hapus data dari table cart
      let deleteCartData = await query(scriptQuery5, data.cart[i].id).catch(
        (err) => {
          throw err;
        }
      );
    }

    // Insert ke table transaction
    let addTransactionData = await query(scriptQuery2, dataToSend).catch(
      (err) => {
        throw err;
      }
    );

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

module.exports = {
  addTransaction,
};
