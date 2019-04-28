const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const EmployeeRoute = require("./routes/EmployeeRoute");
const port = process.env.PORT || 3030;
const app = express();

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/timeoff")
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch(err => {
    console.log("An error occured while conencting to MongoDB", err);
  });

app.use(cors());

// Add middlewares for parsing JSON and urlencoded data and populating `req.body`
app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use("/employee", EmployeeRoute);

app.listen(port).on("listening", () => {
  console.log(`💘 app is listening on ${port}`);
});
