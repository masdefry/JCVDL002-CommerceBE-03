const multer = require("multer");
const fs = require("fs");

module.exports = {
  uploader: (directory, fileNamePrefix) => {
    // Lokasi penyimpanan file
    let defaultDir = "../Public";

    // diskStorage untuk menyimpan file dari front end ke directory back end
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const pathDir = defaultDir + directory;

        // Pengecekan jika directory yang dituju sudah ada atau belum
        if (fs.existsSync(pathDir)) {
          console.log("Directory ada");
          cb(null, pathDir);
        } else {
          fs.mkdir(pathDir, { recursive: true }, (err) => {
            cb(err, pathDir);
          });
        }
        filename: (req, file, cb) => {
          let ext = file.originalname.split(".");
          let filename =
            fileNamePrefix + Data.now() + "." + ext[ext.length - 1];
          cb(null, filename);
        };
      },
    });
    const fileFilter = (req, file, cb) => {
      const ext = /\.(jpg|jpeg|png|pdf|JPG|PNG|JPEG|PDF)/;
      if (!file.originalname.match(ext)) {
        return cb(
          new Error("You cannot upload file with this file type"),
          false
        );
      }
      cb(null, true);
    };
    return multer({
      storage,
      fileFilter,
    });
  },
};
