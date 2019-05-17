const express = require('express');
const router = express.Router();
const LeaveModel = require('../models/LeaveModel');
const EmployeeModel = require('../models/EmployeeModel');
const AuthMiddleWare = require('../middlewares/auth');
const workingDaysBetweenDates = require('../function/date');
const dotevn = require('dotenv');
dotevn.config();

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
// creating a leave request
router.post('/', AuthMiddleWare, async function (req, res) {
  const dateDiff = workingDaysBetweenDates(req.body.from_date, req.body.to_date);
  // validate date
  try {
    if (validateDate(req.body.from_date) || validateDate(req.body.to_date)) {
      res.status(403).json({ status: 'error', message: 'invalid date' });
      return;
    } else if (new Date(req.body.to_date) < new Date(req.body.from_date)) {
      res.status(403).json({ status: 'error', message: 'start date is ahead of stop date' });
      return;
    }
    const employee = await EmployeeModel.findById(req.user)
    if (employee.numberOfLeave === 0) {
      res.status(403).json({ status: 'error', message: 'maximum leave has being reached' })
      return;
    }
    let numberOfLeave = employee.numberOfLeave;
    let remainingDays = numberOfLeave - dateDiff;
    if (remainingDays < 0) {
      res.status(400).json({ status: 'error', message: 'days requested for is more than remaining days left for leave' })
      return;
    }
    // update number of leave
    await EmployeeModel.findByIdAndUpdate(employee._id, { numberOfLeave: remainingDays })
    const leaveRequest = await LeaveModel.create({
      user_id: req.user,
      ...req.body,
      status: 'pending',
      date_created: new Date(),
      name: `${employee.firstName} ${employee.lastName}`,
      department: employee.department
    })
    res.status(201).json({ status: 'success', data: leaveRequest })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
})

// get a user leave request
router.get('/', AuthMiddleWare, async function (req, res) {
  try {
    const leaveRequest = await LeaveModel.find({ user_id: req.user });
    res.status(200).json({ status: 'success', data: leaveRequest })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
})

// get all leave request for admin
router.get('/all', AuthMiddleWare, async function (req, res) {
  try {
    const employee = await EmployeeModel.findById(req.user);
    if (!employee.isAdmin) {
      res.status(412).json({ status: "precondition error", message: 'you are not an admin' })
      return;
    }
    const allLeave = await LeaveModel.find({})
    res.status(200).json({ status: 'success', data: allLeave })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'server error' })
  }
})

// update leave request by admin
router.put('/:id', AuthMiddleWare, async function (req, res) {
  try {
    if (!req.body.status) {
      res.status(403).json({ status: 'error', message: 'status must be provided' });
      return;
    }
    const employee = await EmployeeModel.findById(req.user);
    if (!employee.isAdmin) {
      res.status(412).json({ status: "precondition error", message: 'you are not an admin' })
      return;
    }
    const leave = await LeaveModel.findById(req.params.id);
    if (leave.status !== 'pending') {
      res.status(403).json({ status: 'error', message: 'leave already updated' });
      return;
    }
    const update = {
      status: req.body.status,
      approved_by: `${employee.firstName} ${employee.lastName}`
    }
    if (req.body.status === 'declined') {
      const dateDiff = workingDaysBetweenDates(leave.from_date, leave.to_date);
      const user = await EmployeeModel.findById(leave.user_id)
      await EmployeeModel.findByIdAndUpdate(
        leave.user_id,
        { numberOfLeave: user.numberOfLeave + dateDiff }
      )
    }
    const updateLeave = await LeaveModel.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    )
    res.status(200).json({ status: 'success', message: updateLeave })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'server error' })
  }
})


module.exports = router;