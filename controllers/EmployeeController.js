const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../env");
const EmployeeModel = require("../models/employeemodel");


/**
 *Create Employee Account
 */
const CreateEmployee = async function (req, res) {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const employee = await EmployeeModel.create(req.body);
    const token = jwt.sign({ id: employee._id }, env.jwt_secret, { expiresIn: "1h" });
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
};

/**
 *Login in an Employee into their Account
 */
LoginEmployee = async function (req, res) {
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

        const token = jwt.sign({ id: employee.id }, env.jwt_secret);
        res.status(200).json({ status: "success", data: { token } });
    } catch (error) {
        res.status(500).json({ status: "error", message: "error occured" });
        console.log(error);
    }
}

/**
 *Get the list of all Employees
 */
const GetAllEmployees = async function (req, res) {
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
}

/**
 *Get a single employee profile information
 */
const GetEmployeeProfile = async function (req, res) {
    try {
        const employee = await EmployeeModel.findById(req.user);

        res.json({ status: "Success", data: employee });
    } catch (err) {
        console.log(err);

        //show error to user
        res.status(401).json({ status: "error", message: err.message });
    }
}

module.exports = {
  CreateEmployee,
  LoginEmployee,
  GetAllEmployees,
  GetEmployeeProfile
};
