const express = require("express");
const {getEmployeeList, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getRewardsHistory} = require("../controllers/employee")

const router = express.Router();

/**
 * Route to get list of employees / post a employee
 */
router.route("/").get(getEmployeeList).post(createEmployee);

/**
 * route to get / update / delete a single employee
 */
router.route("/:id").get(getEmployeeById).put(updateEmployee).delete(deleteEmployee);

/**
 * Route to get history of rewards for a user
 */
router.route("/:id/rewards").get(getRewardsHistory);

module.exports = router;