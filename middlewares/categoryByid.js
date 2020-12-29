const Category = require("../models/Category");

const categoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).send();
    }
    req.category = category;
    next();
  } catch (error) {
    res.status(500).send({ error });
  }
};

module.exports = categoryById;
