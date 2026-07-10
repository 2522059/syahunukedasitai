require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { db } = require("./config/firebase");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const hopRoutes = require("./routes/hopRoutes");
const placeRoutes = require("./routes/placeRoutes");
const badgeRoutes = require("./routes/badgeRoutes");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== 動作確認 =====
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Hoppi Backend Running!",
  });
});

// ===== Firestore接続確認 =====
app.get("/test-firestore", async (req, res) => {
  try {
    const docRef = await db.collection("test").add({
      message: "Hello Hoppi!",
      createdAt: new Date(),
    });

    res.json({
      success: true,
      id: docRef.id,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ===== Routes =====
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/hops", hopRoutes);

app.use("/api/places", placeRoutes);

app.use("/api/badges", badgeRoutes);

module.exports = app;
