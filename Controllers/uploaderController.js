const db = require("../Database/Connection");
const { uploader } = require("../Helpers/Uploader");
const fs = require("fs");

module.exports = {
  uploadFile: (req, res) => {
    try {
      let path = "/Images/Bukti Pembayaran";
      const upload = uploader(path, "IMG").fields([{ name: "file" }]);

      upload(req, res, (err) => {
        if (err) {
          res.status(500).send(err);
        }

        const { file } = req.files;
        const filepath = file ? path + "/" + file[0].filename : null;

        let data = JSON.parse(req.body);
        data.image = filepath;

        let sqlInsert = `INSERT INTO payment_proof set (proof, userId, transaction_id) VALUES ()`;
        db.query(sqlInsert, data, (err, result) => {
          if (err) {
            fs.unlinkSync("./public" + filepath);
            res.status(500).send(err);
          }
          res.status(200).send({ message: "File upload success" });
        });
      });
    } catch (error) {
      res.status(500).send(error);
    }
  },
};
