const mongoose = require("mongoose");

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected !");
  })
  .catch((e) => {
    console.log({ DB_Error: e });
  });
