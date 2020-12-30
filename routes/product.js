const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
const Product = require("../models/Product");
const router = express.Router();
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const productById = require("../middlewares/productByid");
const photo = require("../middlewares/photo");

router.get("/", async (req, res) => {
  try {
    let order = req.query.order ? req.query.order : "asc";
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    let limit = req.query.limit ? Number(req.query.limit) : 6;

    Product.find()
      .select("-photo")
      .populate("category", "_id name")
      .sort([[sortBy, order]])
      .limit(limit)
      .exec((err, prod) => {
        if (err) {
          return res.status(404).send({
            msg: "No products found",
            err,
          });
        }
        res.send(prod);
      });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.get("/related/:id", productById, async (req, res) => {
  try {
    let limit = req.query.limit ? Number(req.query.limit) : 6;

    Product.find({ _id: { $ne: req.product }, category: req.product.category })
      .select("-photo")
      .populate("category", "_id name")

      .limit(limit)
      .exec((err, prod) => {
        if (err) {
          return res.status(404).send({
            msg: "No products found",
            err,
          });
        }
        res.send(prod);
      });
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.get("/photo/:id", productById, photo, (req, res) => {});
router.post("/by/search", (req, res) => {
  try {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? Number(req.body.limit) : 100;
    let skip = req.body.skip && Number(req.body.skip);

    let findArgs = {};

    for (let key in req.body.filters) {
      if (req.body.filters[key] > 0) {
        if (key === " price") {
          findArgs[key] = {
            $gte: req.body.filters[key][0],
            $lte: req.body.filters[key][1],
          };
        } else {
          findArgs[key] = req.body.filters[key];
        }
      }
    }
    Product.find(findArgs)
      .select("-photo")
      .populate("category", "_id name")
      .sort([[sortBy, order]])
      .limit(limit)
      .skip(skip)
      .exec((err, prod) => {
        if (err) {
          return res.status(404).send({
            msg: "No products found",
            err,
          });
        }
        res.send({ size: prod.length, data: prod });
      });
  } catch (error) {}
});
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
