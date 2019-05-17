const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../env");
const EmployeeModel = require("../models/employeemodel");
const sendMail = require("../email");

// Create Employee Account
const CreateEmployee = async (req, res) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const employee = await EmployeeModel.create(req.body);
    const token = jwt.sign({ id: employee._id }, env.jwt_secret, {
      expiresIn: "12h"
    });
    const result = employee.toJSON();
    delete result["password"];
    sendMail("confirm", employee.email, token);
    res.status(200).json({ status: "success", result });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({
        status: "error",
        message: `${req.body.email} is associated with another account`
      });
    } else {
      res.status(500).json({
        status: "error",
        message: err
      });
    }
  }
};

// Login in an Employee into their Account
LoginEmployee = async (req, res) => {
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

    // check if user as been verified
    if (!employee.isVerified)
      return res.status(412).json({
        status: "error",
        message:
          "Please verify your account by clicking on the link sent to your email address"
      });
    const token = jwt.sign({ id: employee.id }, env.jwt_secret);
    res.status(200).json({ status: "success", token });
  } catch (error) {
    res.status(500).json({ status: "error", message: "error occured" });
    console.log(error);
  }
};

// Get the list of all Employees
const GetAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeModel.find({});
    res.json({
      status: "Success",
      employees
    });
  } catch (err) {
    console.log(err);
    res.status(200).json({
      status: "error",
      message: "An error occurred while trying to get all account"
    });
  }
};

// Get a single employee profile information
const GetEmployeeProfile = async (req, res) => {
  try {
    const profile = await EmployeeModel.findById(req.user);
    if (!profile)
      return res.status(404).json({
        status: "error",
        message: "You are not an authorized user"
      });
    res.json({ status: "Success", profile });
  } catch (err) {
    console.log(err);

    //show error to user
    res.status(401).json({ status: "error", message: "server error" });
  }
};

// Email Verification
const EmailVerification = async (req, res) => {
  try {
    const token = req.body.token;
    const tokenData = jwt.verify(token, env.jwt_secret);

    const employee = await EmployeeModel.findById(tokenData.id);
    if (employee.isVerified)
      return res.status(422).json({
        status: "error",
        message: "account has already been verified"
      });

    const updateEmployee = await EmployeeModel.findByIdAndUpdate(tokenData.id, {
      isVerified: true
    });
    if (!updateEmployee)
      return res.status(403).json({
        status: "error",
        message: "Employee not found"
      });
    res.status(200).json({ status: "success", updateEmployee });
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "you are not authorizaed"
    });
  }
};

// Resend Email
const ResendEmail = async (req, res) => {
  try {
    const employee = await EmployeeModel.findOne({ email: req.body.email });
    if (!employee)
      return res
        .status(404)
        .json({ status: "error", message: "employee not found" });
    if (user.isVerified)
      return res
        .status(422)
        .json({ status: "error", message: "you are already verified" });
    const token = jwt.sign(
      {
        id: employee._id
      },
      env.jwt_secret,
      {
        expiresIn: "1h"
      }
    );
    sendMail("Confirm", employee.email, token);
    res.status(200).json({
      status: "success",
      message: "verification message has been sented"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "server error" });
  }
};

const ForgetPassword = async (req, res) => {
  try {
    const employee = await EmployeeModel.findOne({ email: req.body.email });
    if (employee) {
      const token = jwt.sign(
        {
          id: employee._id
        },
        env.jwt_secret,
        {
          expiresIn: "2h"
        }
      );
      sendMail("rseset-password", employee.email, token);
    }
    res.status(200).json({
      status: "success",
      message: "reset password link has been sent to your email"
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "server error" });
  }
};

const ResetPassword = async (req, res) => {
  try {
    if (!(req.body && req.body.token && req.body.password)) {
      return res.status(403).json({
        status: "invalid params",
        message: "email and token is required"
      });
    }
    const verifyToken = jwt.verify(req.body.token, env.jwt_secret);

    const employee = await EmployeeModel.findById(verifyToken.id);
    if (!employee)
      res.status(404).json({ status: "error", message: "employee not found" });

    const password = await bcrypt.hash(req.body.password, 10);
    const updatePassword = await EmployeeModel.findByIdAndUpdate(employee._id, {
      password
    });

    res.status(200).json({ status: "success", message: updatePassword });
  } catch (error) {
    res.status(401).json({ status: "error", message: error });
  }
};

module.exports = {
  CreateEmployee,
  LoginEmployee,
  GetAllEmployees,
  GetEmployeeProfile,
  EmailVerification,
  ResendEmail,
  ForgetPassword,
  ResetPassword
};
