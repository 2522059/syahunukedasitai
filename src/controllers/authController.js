const { getAuth } = require("firebase-admin/auth");
const { db } = require("../config/firebase");

exports.login = async (req, res) => {

    try {

        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                message: "idToken is required"
            });
        }

        const decoded = await getAuth().verifyIdToken(idToken);

        const uid = decoded.uid;

        const userRef = db.collection("users").doc(uid);

        const doc = await userRef.get();

        // 初回ログイン
        if (!doc.exists) {

            await userRef.set({

                uid,

                nickname: decoded.name || "Hoppi User",

                email: decoded.email,

                photoURL: decoded.picture,

                streak: 0,

                level: 1,

                exp: 0,

                visitedCount: 0,
                visitedPlaceCount: 0,
                visitedPlaces: [],

                badges: [],

                createdAt: new Date()

            });

        }

        res.json({

            success: true,

            user: decoded

        });

    } catch (err) {

        console.error(err);

        res.status(401).json({

            success: false,

            error: err.message

        });

    }

};
