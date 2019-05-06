const express = require("express");
const AuthMiddleware = require("../middlewares/auth");
const EmployeeController = require("../controllers/EmployeeController");
const router = express.Router();


router.post("/SignUp", EmployeeController.CreateEmployee);

router.post("/Login", EmployeeController.LoginEmployee);

router.get("/", EmployeeController.GetAllEmployees);

router.get("/profile", AuthMiddleware, EmployeeController.GetEmployeeProfile);

module.exports = router;
