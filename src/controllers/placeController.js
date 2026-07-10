const { db } = require("../config/firebase");
const { searchPlaces } = require("../services/googlePlacesService");
const { applyBadges } = require("../services/badgeService");

function getNow() {
    return new Intl.DateTimeFormat("sv-SE", {
        timeZone: process.env.APP_TIME_ZONE || "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(new Date()).replace(" ", "T") + "+09:00";
}

function createPlaceId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

exports.addVisitedPlace = async (req, res) => {
    try {

        const uid = req.params.uid;
        const {
            name,
            category = "",
            address = "",
            memo = "",
            visitedAt = "",
            googlePlaceId = "",
            latitude = null,
            longitude = null,
            googleMapsUri = ""
        } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({
                success: false,
                message: "場所名nameは必須です"
            });
        }

        const userRef = db.collection("users").doc(uid);

        const result = await db.runTransaction(async (transaction) => {

            const doc = await transaction.get(userRef);

            if (!doc.exists) {
                return {
                    status: 404,
                    body: {
                        success: false,
                        message: "User not found"
                    }
                };
            }

            const user = doc.data();
            const visitedPlaces = Array.isArray(user.visitedPlaces)
                ? user.visitedPlaces
                : [];
            const place = {
                id: createPlaceId(),
                name: String(name).trim(),
                category: String(category).trim(),
                address: String(address).trim(),
                memo: String(memo).trim(),
                googlePlaceId: String(googlePlaceId).trim(),
                latitude,
                longitude,
                googleMapsUri: String(googleMapsUri).trim(),
                visitedAt: visitedAt || getNow(),
                createdAt: getNow()
            };
            const nextVisitedPlaces = [...visitedPlaces, place];
            const badgeResult = applyBadges({
                ...user,
                visitedPlaces: nextVisitedPlaces,
                visitedPlaceCount: nextVisitedPlaces.length
            });

            transaction.update(userRef, {
                visitedPlaces: nextVisitedPlaces,
                visitedPlaceCount: nextVisitedPlaces.length,
                badges: badgeResult.badges
            });

            return {
                status: 201,
                body: {
                    success: true,
                    place,
                    visitedPlaceCount: nextVisitedPlaces.length,
                    newBadges: badgeResult.newBadges
                }
            };

        });

        res.status(result.status).json(result.body);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};

exports.searchGooglePlaces = async (req, res) => {
    try {

        const keyword = String(req.query.keyword || "").trim();

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: "keywordは必須です"
            });
        }

        const places = await searchPlaces(keyword);

        res.json({
            success: true,
            keyword,
            places
        });

    } catch (err) {

        console.error(err);

        res.status(err.status || 500).json({
            success: false,
            error: err.message
        });

    }
};

exports.getVisitedPlaces = async (req, res) => {
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
        const visitedPlaces = Array.isArray(user.visitedPlaces)
            ? user.visitedPlaces
            : [];

        res.json({
            success: true,
            visitedPlaces: visitedPlaces.slice().reverse(),
            visitedPlaceCount: visitedPlaces.length
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};

exports.deleteVisitedPlace = async (req, res) => {
    try {

        const uid = req.params.uid;
        const placeId = req.params.placeId;
        const userRef = db.collection("users").doc(uid);

        const result = await db.runTransaction(async (transaction) => {

            const doc = await transaction.get(userRef);

            if (!doc.exists) {
                return {
                    status: 404,
                    body: {
                        success: false,
                        message: "User not found"
                    }
                };
            }

            const user = doc.data();
            const visitedPlaces = Array.isArray(user.visitedPlaces)
                ? user.visitedPlaces
                : [];
            const nextVisitedPlaces = visitedPlaces.filter((place) => place.id !== placeId);

            if (nextVisitedPlaces.length === visitedPlaces.length) {
                return {
                    status: 404,
                    body: {
                        success: false,
                        message: "指定された場所が見つかりません"
                    }
                };
            }

            transaction.update(userRef, {
                visitedPlaces: nextVisitedPlaces,
                visitedPlaceCount: nextVisitedPlaces.length
            });

            return {
                status: 200,
                body: {
                    success: true,
                    message: "場所を削除しました",
                    visitedPlaceCount: nextVisitedPlaces.length
                }
            };

        });

        res.status(result.status).json(result.body);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};
