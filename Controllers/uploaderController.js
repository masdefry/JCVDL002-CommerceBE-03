const db = require("../Database/Connection");
const { uploader } = require("../Helpers/Uploader");
const fs = require("fs");

module.exports = {
  uploadPayment: (req, res) => {
    try {
      let path = "/Bukti Pembayaran";
      const upload = uploader(path, `Payment_Transaction`).fields([
        { name: "file" },
      ]);

      upload(req, res, (err) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        }

        let data = JSON.parse(req.body.data);
        console.dir(req.body);

        const { file } = req.files;
        const filepath = file ? file[0].filename : null;

        let sqlInsert = `INSERT INTO payment_proof (proof, user_id, transaction_id) VALUES (${db.escape(
          filepath
        )}, ${db.escape(req.user.id)}, ${db.escape(data.transaction_id)})`;

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
