const express = require("express");
const router = express.Router();

const {
    getBadgeCatalog,
    getUserBadges
} = require("../controllers/badgeController");

router.get("/", getBadgeCatalog);

router.get("/:uid", getUserBadges);

module.exports = router;
