const express = require("express");
const LeaveRequestModel = require("../models/leaveRequestModel");
const AuthMiddleware = require("../middlewares/auth");
const router = express.Router();

// Create a Leave Request
router.post(
  "/",
  async function(req, res) {
    try {
      const leaveRequest = await LeaveRequestModel.create({
        leaveType: req.body.leaveType,
        startDate: req.body.startDate,
        stopDate: req.body.stopDate,
        duration: req.body.duration,
        leaveReason: req.body.leaveReason,
        employee: req.body.employee
      });

      res.json({ status: "success", data: leaveRequest });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "🤦🏾 an error occured while creating your article"
      });
    }
  }
);

// Get all employee leaveRequests
router.get("/", AuthMiddleware, async function(req, res) {
  try {
    const leaveRequests = await LeaveRequestModel.find({ employee: req.user });

    res.json({ status: "success", data: leaveRequests });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Could not find articles!" });
  }
});

module.exports = router;
