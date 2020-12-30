const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth, isAdmin } = require("../middlewares/auth");

router.get("/", auth, isAdmin, (req, res) => {
  res.send("Hello World !");
});
router.post("/users/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.cookie("token", token, { expire: new Date() + 9999 });
    res.status(201).send({ user, token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).send({ error: "This email is already taken" });
    }
    res.status(400).send({ error });
  }
});
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.cookie("token", token, { expire: new Date() + 9999 });

    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: "Unable to login !" });
  }
});
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "password", "about", "email", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.clearCookie("token");
    res.send("Logged out");
  } catch (error) {
    res.status(500).send();
  }
});
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.clearCookie("token");
    res.send("Logged out of all devices");
  } catch (error) {
    res.status(500).send();
  }
});
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
