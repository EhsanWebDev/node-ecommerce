const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decode = jwt.verify(token, "mySecret");

    const user = await User.findOne({ _id: decode.id, "tokens.token": token });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).send({ error: "Please Authenticate" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role === 0) {
    return res.status(403).send({ error: "Admin resource. Access denied !" });
  }
  next();
};

module.exports = { auth, isAdmin };
