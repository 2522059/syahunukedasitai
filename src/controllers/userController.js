const { db } = require("../config/firebase");

// ユーザー作成
exports.createUser = async (req, res) => {
    try {

        const {
            uid,
            nickname,
            icon,
            interests
        } = req.body;

        if (!uid || !nickname) {
            return res.status(400).json({
                success: false,
                message: "uidとnicknameは必須です"
            });
        }

        const userRef = db.collection("users").doc(uid);

        const doc = await userRef.get();

        if (doc.exists) {
            return res.status(409).json({
                success: false,
                message: "このユーザーは既に存在します"
            });
        }

        await userRef.set({

            uid,
            nickname,
            icon: icon || "",

            interests: interests || [],

            streak: 0,
            level: 1,
            exp: 0,

            visitedCount: 0,
            visitedPlaceCount: 0,
            visitedPlaces: [],

            badges: [],

            createdAt: new Date()

        });

        res.status(201).json({

            success: true,
            message: "ユーザー作成成功"

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            error: err.message

        });

    }
};

// ユーザー取得
exports.getUser = async (req, res) => {

    try {

        const uid = req.params.uid;

        const doc = await db.collection("users").doc(uid).get();

        if (!doc.exists) {

            return res.status(404).json({

                success: false,
                message: "ユーザーが存在しません"

            });

        }

        res.json({

            success: true,
            user: doc.data()

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            error: err.message

        });

    }

};

// ユーザー更新
exports.updateUser = async (req, res) => {

    try {

        const uid = req.params.uid;

        await db.collection("users").doc(uid).update(req.body);

        res.json({

            success: true,
            message: "更新しました"

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            error: err.message

        });

    }

};

// ユーザー削除
exports.deleteUser = async (req, res) => {

    try {

        const uid = req.params.uid;

        await db.collection("users").doc(uid).delete();

        res.json({

            success: true,
            message: "削除しました"

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,
            error: err.message

        });

    }

};
