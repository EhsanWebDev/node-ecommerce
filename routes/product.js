const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
const Product = require("../models/Product");
const router = express.Router();
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const productById = require("../middlewares/productByid");

router.post("/create", auth, isAdmin, async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).send({ error: err });
      }

      const { name, description, price, category, quantity, shipping } = fields;
      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !quantity ||
        !shipping
      ) {
        return res.status(400).send({
          error: "All fields are required",
          fields: [
            "name",
            "description",
            "price",
            "category",
            "quantity",
            "shipping",
            "photo",
          ],
        });
      }

      const product = new Product(fields);

      if (files.photo) {
        if (files.photo.size > 1000000) {
          return res.status(400).send({
            error: "Image size should be less than 1MB",
          });
        }
        product.photo.data = fs.readFileSync(files.photo.path);
        product.photo.contentType = files.photo.type;
      }

      await product.save();
      res.status(201).send(product);
    });
  } catch (error) {
    res.status(400).send({ error });
  }
});
router.put("/:id", auth, isAdmin, productById, async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).send({ error: err });
      }

      const { name, description, price, category, quantity, shipping } = fields;
      if (
        !name ||
        !description ||
        !price ||
        !category ||
        !quantity ||
        !shipping
      ) {
        return res.status(400).send({
          error: "All fields are required",
          fields: [
            "name",
            "description",
            "price",
            "category",
            "quantity",
            "shipping",
            "photo",
          ],
        });
      }

      let product = req.product;
      product = _.extend(product, fields);

      if (files.photo.type) {
        if (files.photo.size > 1000000) {
          return res.status(400).send({
            error: "Image size should be less than 1MB",
          });
        }
        product.photo.data = fs.readFileSync(files.photo.path);
        product.photo.contentType = files.photo.type;
      }

      await product.save();
      product.photo = undefined;
      res.status(200).send(product);
    });
  } catch (error) {
    res.status(400).send({ error });
  }
});
router.get("/:id", productById, (req, res) => {
  req.product.photo = undefined;
  res.send(req.product);
});
router.delete("/:id", auth, isAdmin, productById, async (req, res) => {
  await req.product.remove();
  res.send({
    msg: "Product deleted successfully",
  });
});

module.exports = router;
