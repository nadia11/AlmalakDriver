const express = require("express");
const bodyParser = require("body-parser");
const mongoDbConnectionString = require('./config/mongodb');
const mongoose = require("mongoose");
const userRouter = require("./routes/users");
const PORT = 4000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/users", userRouter);

mongoose.connect(mongoDbConnectionString, { useNewUrlParser: true })
.then(result => {
  console.log("Connected to Mongodb");
  app.listen(PORT, () => console.log('server is running on PORT:' + PORT));
})
.catch(err => { console.error(err); });
