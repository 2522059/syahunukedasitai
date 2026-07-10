const express = require("express");
const router = express.Router();

const {
    addVisitedPlace,
    searchGooglePlaces,
    getVisitedPlaces,
    deleteVisitedPlace
} = require("../controllers/placeController");

router.get("/search", searchGooglePlaces);

router.post("/:uid", addVisitedPlace);

router.get("/:uid", getVisitedPlaces);

router.delete("/:uid/:placeId", deleteVisitedPlace);

module.exports = router;
