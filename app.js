const express = require("express");
const app = express();
const port = 3000;
const router = require("./routes/index");
const morgan = require("morgan");

app.use(morgan("common"));
require("dotenv").config();
app.use(router);

app.listen(port, () => {
  console.log(`Server is live on port ${port}`);
});
