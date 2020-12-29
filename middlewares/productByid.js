const Product = require("../models/Product");

const productById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send();
    }
    req.product = product;
    next();
  } catch (error) {
    res.status(500).send({ error });
  }
};

module.exports = productById;
