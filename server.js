const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const EmployeeRoute = require("./routes/EmployeeRoute");
const env = require("./env");
const app = express();

// Connect to MongoDB
mongoose
  .connect(env.mongodb_url, { useNewUrlParser: true, useCreateIndex: true })
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch(err => {
    console.log("An error occured while conencting to MongoDB", err);
  });

app.use(cors());

// logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toTimeString()}]: ${req.method} ${req.url}`);
  next();
});

// Add middlewares for parsing JSON and urlencoded data and populating `req.body`
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use("/employee", EmployeeRoute);

app.listen(env.port).on("listening", () => {
  console.log(`💘 app is listening on ${env.port}`);
});
