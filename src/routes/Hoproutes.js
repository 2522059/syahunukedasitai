const express = require("express");
const router = express.Router();

const {
    todayHop,
    completeHop,
    createReview,
    getReviews
} = require("../controllers/hopController");

router.get("/today/:uid", todayHop);

router.post("/complete/:uid", completeHop);

router.post("/review/:uid", createReview);

router.get("/reviews/:uid", getReviews);

module.exports = router;
