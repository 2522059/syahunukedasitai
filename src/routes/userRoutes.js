const express = require("express");
const router = express.Router();

const {
    createUser,
    getUser,
    updateUser
} = require("../controllers/userController");

router.post("/", createUser);

router.get("/:uid", getUser);

router.patch("/:uid", updateUser);

module.exports = router;