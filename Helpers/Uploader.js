const multer = require("multer");
const fs = require("fs");

module.exports = {
  uploader: (directory, fileNamePrefix) => {
    //lokasi penyimpanan gambar
    let defaultDir = "./Public/Images";

    //konfigurasi storage
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const pathDir = defaultDir + directory;
        if (fs.existsSync(pathDir)) {
          cb(null, pathDir);
        } else {
          fs.mkdir(pathDir, { recursive: true }, (err) => cb(err, pathDir));
        }
      },

      //rename nama file
      filename: (req, file, cb) => {
        let ext = file.originalname.split(".");
        let filename =
          fileNamePrefix + "_" + Date.now() + "." + ext[ext.length - 1];

        cb(null, filename);
      },
    });

    /**Konfigurasi jenis file */
    const fileFilter = (req, file, cb) => {
      const ext = /\.(jpg|jpeg|png|JPG|PNG|JPEG)/;
      if (!file.originalname.match(ext)) {
        return cb(new Error("Your file type are denied"), false);
      }
      cb(null, true);
    };

    return multer({
      storage,
      fileFilter,
    });
  },
};
