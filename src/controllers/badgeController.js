const { db } = require("../config/firebase");
const { getAllBadges } = require("../services/badgeService");

exports.getBadgeCatalog = (req, res) => {
    res.json({
        success: true,
        badges: getAllBadges()
    });
};

exports.getUserBadges = async (req, res) => {
    try {

        const uid = req.params.uid;
        const doc = await db.collection("users").doc(uid).get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = doc.data();

        res.json({
            success: true,
            badges: Array.isArray(user.badges) ? user.badges : []
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};
