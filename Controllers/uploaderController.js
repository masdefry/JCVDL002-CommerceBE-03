const db = require("../Database/Connection");
const { uploader } = require("../Helpers/Uploader");
const fs = require("fs");

module.exports = {
  uploadPayment: (req, res) => {
    try {
      let path = "/Bukti Pembayaran/";
      const upload = uploader(path, `Payment_Transaction`).fields([
        { name: "file" },
      ]);

      upload(req, res, (err) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        }

        let data = JSON.parse(req.body.data);

        const { file } = req.files;
        const filepath = file ? path + file[0].filename : null;

        let sqlInsert = `INSERT INTO payment_proof (proof, user_id, transaction_id) VALUES (${db.escape(
          file[0].filename
        )}, ${db.escape(req.user.id)}, ${db.escape(data.transaction_id)})`;

        let sqlUpdate = `INSERT INTO transaction_status (transaction_id, transaction_date, status_id) VALUES (${db.escape(
          data.transaction_id
        )}, ${db.escape(new Date())}, ${db.escape(2)})`;

        db.query(sqlInsert, (err, results) => {
          if (err) {
            console.log(err);
            fs.unlinkSync("./Public/Images" + filepath);
            return res.status(500).send(err);
          }

          db.query(sqlUpdate, (err, results) => {
            if (err) {
              console.log(err);
              fs.unlinkSync("./Public/Images" + filepath);
              return res.status(500).send(err);
            }
            return res
              .status(200)
              .send({ message: "Upload file success", success: true });
          });
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  uploadProduct: (req, res) => {
    try {
      let path = "/Products/";
      const upload = uploader(path, `Product`).fields([{ name: "file" }]);

      upload(req, res, (err) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        }

        let data = JSON.parse(req.body.data);

        const { file } = req.files;
        const filepath = file ? path + file[0].filename : null;

        let sqlInsert = `INSERT INTO product_image (image, id_product) VALUES (${db.escape(
          file[0].filename
        )}, ${db.escape(data.id_product)})`;

        db.query(sqlInsert, (err, results) => {
          if (err) {
            console.log(err);
            fs.unlinkSync("./Public/Images" + filepath);
            return res.status(500).send(err);
          }
          return res
            .status(200)
            .send({ message: "Upload file success", success: true });
        });
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
};
