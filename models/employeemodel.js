const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * mongoose writer schema
 */

const employeeSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dob: {
    type: String
  },
  department: {
    type: String
  },
  manager: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  country: {
    type: String
  },
  time_zone: {
    type: String
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  }
});

//model which provides us with an interface to iteract with our data
const EmployeeModel = mongoose.model("Employee", employeeSchema);

module.exports = EmployeeModel;
