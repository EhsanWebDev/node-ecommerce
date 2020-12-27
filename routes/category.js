const express = require("express");
const { auth, isAdmin } = require("../middlewares/auth");
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

module.exports = router;
