const mongoose = require("mongoose");

/**
 * Mongoose Employee schema which is a description/blueprint of how we want our data to look like
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
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  manager: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
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
  },
  numberOfLeave: {
    type: Number,
    default: 20
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});

//model which provides us with an interface to iteract with our data
const EmployeeModel = mongoose.model("Employee", employeeSchema);

module.exports = EmployeeModel;
