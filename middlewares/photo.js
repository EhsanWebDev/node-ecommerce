const photo = (req, res, next) => {
  try {
    if (req.product.photo.data) {
      res.set("Content-Type", req.product.photo.contentType);
      res.send(req.product.photo.data);
    }
    next();
  } catch (error) {
    res.status(500).send({ error });
  }
};

module.exports = photo;
