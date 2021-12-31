const express = require("express")
const router = express.Router();
const {getActivityList, getSingleActivity, createActivity, updateActivity, deleteActivity} = require("../controllers/activity");

/**
 * Get list and post route for activity
 */
router.route("/").get(getActivityList).post(createActivity);

/**
 * route to get / update /delete a single activity
 */
router.route("/:id").get(getSingleActivity).put(updateActivity).delete(deleteActivity);

module.exports = router; 