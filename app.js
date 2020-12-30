const express = require("express");
require("dotenv").config();
require("./db/mongoose");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");

const morgan = require("morgan");
const port = process.env.PORT || 4001;

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use("/api", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);

app.listen(port, () => {
  console.log(`App is running on ${port}`);
});
