const LeaveRequestModel = require("../models/leaveRequestModel");
function validateDate(date) {
  var selectedDate = new Date(date);
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  if (selectedDate < now) {
    return true
  } else {
    return false
  }
}

// Create a new leave request
const CreateLeaveRequest = async function(req, res) {
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
};
/**
 * Get all employee leaveRequests
 */

const GetLeaveRequest = async function(req, res) {
  try {
    const leaveRequests = await LeaveRequestModel.find({
      employee: req.user
    }).populate("employee", "firstName lastName department");

    res.json({ status: "success", data: leaveRequests });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Could not find requests!" });
  }
};

module.exports = {
  CreateLeaveRequest,
  GetLeaveRequest
};
