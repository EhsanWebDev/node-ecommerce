const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
const categoryById = require("../middlewares/categoryByid");
const Category = require("../models/Category");
const router = express.Router();

router.post("/create", auth, isAdmin, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).send(category);
  } catch (error) {
    res.status(400).send({ error });
  }
});
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.send(categories);
  } catch (error) {
    res.status(500).send({ error });
  }
});
router.put("/:id", auth, categoryById, async (req, res) => {
  req.category.name = req.body.name;
  await req.category.save();
  res.send(req.category);
});
router.get("/:id", auth, categoryById, (req, res) => {
  res.send(req.category);
});
router.delete("/:id", auth, isAdmin, categoryById, async (req, res) => {
  await req.category.remove();
  res.send({
    msg: "Category deleted successfully",
  });
});

module.exports = router;
