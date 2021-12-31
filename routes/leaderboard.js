const express = require("express")
const {getLeaderboardList} = require("../controllers/leaderboard");

const router = express.Router();

/**
 * Route for leaderboard
 */
router.route("/").get(getLeaderboardList);

module.exports = router;