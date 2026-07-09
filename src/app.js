const express = require("express");
const cors = require("cors");

const { db } = require("./config/firebase");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "🚀 Hoppi Backend Running!"
    });
});

// Firestore接続確認
app.get("/test-firestore", async (req, res) => {

    try {

        const docRef = await db.collection("test").add({
            message: "Hello Hoppi!",
            createdAt: new Date()
        });

        res.json({
            success: true,
            id: docRef.id
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

module.exports = app;