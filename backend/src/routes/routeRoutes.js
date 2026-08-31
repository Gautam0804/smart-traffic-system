const express = require("express");

const {
  getBestRoute,
} = require("../controllers/routeController");

const router = express.Router();

router.get("/best", getBestRoute);

module.exports = router;