const express = require("express");
require("dotenv").config();
require("./db/mongoose");
const app = express();
const userRoutes = require("./routes/user");

const morgan = require("morgan");
const port = process.env.PORT || 4001;

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`App is running on ${port}`);
});
