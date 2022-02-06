const util = require("util");

// Import connection
const db = require("../Database/Connection");

let query = util.promisify(db.query).bind(db);

const getProducts = async (req, res) => {
  let { gender, category, searchName, page, sortBy } = req.query;

  page = parseInt(page);
  const limit = 8;
  let offset = (page - 1) * limit;
  if (Number.isNaN(offset)) {
    offset = 0;
  }

  // Untuk mengambil data produk
  let scriptQuery = `SELECT p.id, product_name, product_price, category_id, gender_id, stock, image, detail_product FROM product p JOIN product_image pi ON p.id = pi.id_product GROUP BY p.id `;

  try {
    let getDataProducts = await query(scriptQuery, []);

    const filterProducts = getDataProducts.filter((product) => {
      if (!category && !gender && !searchName) {
        return product;
      } else if (category && gender) {
        return (
          product.product_name
            .toLowerCase()
            .includes(searchName.toLowerCase()) &&
          product.category_id == category &&
          product.gender_id == gender
        );
      } else if (category && !gender) {
        return (
          product.product_name
            .toLowerCase()
            .includes(searchName.toLowerCase()) &&
          product.category_id == category
        );
      } else if (gender && !category) {
        return (
          product.product_name
            .toLowerCase()
            .includes(searchName.toLowerCase()) && product.gender_id == gender
        );
      } else {
        return product.product_name
          .toLowerCase()
          .includes(searchName.toLowerCase());
      }
    });

    let maxPage = Math.ceil(filterProducts.length / limit);

    const compareString = (a, b) => {
      if (a.product_name < b.product_name) {
        return -1;
      }
      if (a.product_name > b.product_name) {
        return 1;
      }
      return 0;
    };

    switch (sortBy) {
      case "lowPrice":
        filterProducts.sort((a, b) => a.product_price - b.product_price);
        break;
      case "highPrice":
        filterProducts.sort((a, b) => b.product_price - a.product_price);
        break;
      case "AtoZ":
        filterProducts.sort(compareString);
        break;
      case "ZtoA":
        filterProducts.sort((a, b) => compareString(b, a));
        break;
      default:
        filterProducts;
        break;
    }

    const currentProducts = filterProducts.slice(offset, offset + limit);

    res.status(200).send({
      data: [...currentProducts],
      maxPage,
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  let scriptQuery = `SELECT id, product_name, product_price, detail_product, stock, gender_id, category_id FROM product WHERE id = ?`;

  let scriptQuery1 = `SELECT image FROM product_image WHERE id_product = ?`;

  try {
    let getData = await query(scriptQuery, req.params.id).catch((err) => {
      throw err;
    });

    let getImage = await query(scriptQuery1, req.params.id).catch((err) => {
      throw err;
    });

    res.status(200).send({
      data: [...getData],
      image: [...getImage],
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const addProduct = async (req, res) => {
  let {
    product_name,
    product_price,
    category_id,
    gender_id,
    stock,
    detail_product,
  } = req.body;

  let scriptQuery = `INSERT INTO product SET ?`;

  let dataToSend = {
    product_name,
    product_price,
    category_id,
    gender_id,
    stock,
    detail_product,
  };

  try {
    let inputDataProduct = await query(scriptQuery, dataToSend).catch((err) => {
      throw err;
    });
    res.status(200).send({
      message: "Product has been added to database",
      id_product: inputDataProduct.insertId,
    });
  } catch (error) {
    if (error.status) {
      // Error yang dikirim oleh kita
      res.status(error.status).send({
        error: true,
        message: error.message,
      });
    } else {
      // Error yang dikirim oleh server
      console.log(error);
      res.status(500).send({
        error: true,
        message: error.message,
      });
    }
  }
};

const editProduct = async (req, res) => {
  let {
    product_name,
    product_price,
    category_id,
    gender_id,
    stock,
    detail_product,
  } = req.body;

  let scriptQuery = `UPDATE product SET ? WHERE id = ?`;

  let dataToSend = {
    product_name,
    product_price,
    category_id,
    gender_id,
    stock,
    detail_product,
  };

  try {
    let editDataProduct = await query(scriptQuery, [
      dataToSend,
      req.params.id,
    ]).catch((err) => {
      throw err;
    });
    res.status(200).send({
      message: "Product has been edited",
    });
  } catch (error) {
    res.status(500).send({
      error: true,
      message: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  let scriptQuery = `DELETE FROM product_image WHERE id_product = ?`;
  let scriptQuery1 = `DELETE FROM product WHERE id = ?`;

  try {
    let deleteProductImage = await query(scriptQuery, req.params.id).catch(
      (err) => {
        throw err;
      }
    );
    let deleteProductData = await query(scriptQuery1, req.params.id).catch(
      (err) => {
        throw err;
      }
    );

    res.status(200).send({
      message: "Product has been deleted",
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
  getProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
};
