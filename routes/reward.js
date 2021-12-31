const express = require("express");
const router = express.Router();
const {getRewardList, getSingleReward, createReward} = require("../controllers/reward");

/**
 * route for get list of rewards / post a reward record
 */
router.route("/").get(getRewardList).post(createReward);

/**
 * route to get a single reward record
 */
router.route("/:id").get(getSingleReward);

module.exports = router; 