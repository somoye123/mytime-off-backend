const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const EmployeeModel = require("../models/employeemodel");
const AuthMiddleware = require("../middlewares/auth");
const router = express.Router();
const dotevn = require("dotenv");
dotevn.config();
const SECRET = "LEV3LUP!74";

// Create Employee Account
router.post("/SignUp", async function(req, res) {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const employee = await EmployeeModel.create(req.body);
    const token = jwt.sign({ id: employee._id }, SECRET, { expiresIn: "1h" });
    const result = employee.toJSON();
    delete result["password"];
    res.status(200).json({
      status: "success",
      data: { result, token }
    });
  } catch (err) {
    if (err.code === 11000) {
      res
        .status(400)
        .json({ status: "error", message: "this email already exist" });
    } else {
      res.status(500).json({
        status: "error",
        message: err
      });
    }
  }
});

// login
router.post("/Login", async function(req, res) {
  try {
    const employee = await EmployeeModel.findOne(
      { email: req.body.email },
      "+password"
    );
    if (!employee)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid login details" });

    //compare user's password to log the user in
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      employee.password
    );
    if (!isValidPassword)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid Login details" });

    // const result = employee.toJSON();
    // delete result["password"];
    const token = jwt.sign({ id: employee.id }, SECRET);
    res.status(200).json({ status: "success", data: { token } });
  } catch (error) {
    res.status(500).json({ status: "error", message: "error occured" });
    console.log(error);
  }
});

// get all employees
router.get("/", async function(req, res) {
  try {
    const search = req.query.gender ? { gender: req.query.gender } : {};

    const employees = await EmployeeModel.find(search);
    res.json({
      status: "Success",
      employees
    });
  } catch (err) {
    console.log(err);

    res.status(200).json({
      status: "error",
      message: "An error occurred while trying to get an account"
    });
  }
});

router.get("/profile", AuthMiddleware, async function(req, res) {
  try {
    const employee = await EmployeeModel.findById(req.user);

    res.json({ status: "Success", data: employee });
  } catch (err) {
    console.log(err);

    //show error to user
    res.status(401).json({ status: "error", message: err.message });
  }
});

module.exports = router;
