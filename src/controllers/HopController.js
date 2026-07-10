const { db } = require("../config/firebase");
const { generateHop } = require("../services/geminiService");
const { applyBadges } = require("../services/badgeService");

function getToday() {
    const timeZone = process.env.APP_TIME_ZONE || "Asia/Tokyo";

    return new Intl.DateTimeFormat("sv-SE", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

function getNow() {
    const timeZone = process.env.APP_TIME_ZONE || "Asia/Tokyo";
    const parts = new Intl.DateTimeFormat("sv-SE", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).formatToParts(new Date());
    const values = Object.fromEntries(
        parts
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}+09:00`;
}

function getYesterday(today) {
    const date = new Date(`${today}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().split("T")[0];
}

function calculateLevel(exp) {
    return Math.floor(exp / 100) + 1;
}

function validateRating(rating) {
    const parsedRating = Number(rating);

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return null;
    }

    return parsedRating;
}

exports.todayHop = async (req, res) => {
    try {

        const uid = req.params.uid;

        const userRef = db.collection("users").doc(uid);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = doc.data();

        // 今日の日付
        const today = getToday();

        // 既に今日のHopがあるか
        if (
            user.todayHop &&
            user.todayHop.createdAt === today
        ) {

            return res.json({
                success: true,
                hop: user.todayHop,
                cached: true
            });

        }

        // Gemini生成
        const result = await generateHop(user);

        const hop = JSON.parse(
            result
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim()
        );

        hop.completed = false;
        hop.createdAt = today;

        // Firestore保存
        await userRef.update({
            todayHop: hop
        });

        res.json({
            success: true,
            hop,
            cached: false
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};

exports.completeHop = async (req, res) => {
    try {

        const uid = req.params.uid;
        const userRef = db.collection("users").doc(uid);
        const today = getToday();

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
            const todayHop = user.todayHop;

            if (!todayHop || todayHop.createdAt !== today) {
                return {
                    status: 400,
                    body: {
                        success: false,
                        message: "今日のHopがまだ生成されていません"
                    }
                };
            }

            if (todayHop.completed) {
                return {
                    status: 200,
                    body: {
                        success: true,
                        hop: todayHop,
                        alreadyCompleted: true,
                        userStatus: {
                            exp: user.exp || 0,
                            level: user.level || 1,
                            streak: user.streak || 0,
                            visitedCount: user.visitedCount || 0
                        }
                    }
                };
            }

            const gainedExp = Number(todayHop.exp) || 0;
            const currentExp = user.exp || 0;
            const currentLevel = user.level || 1;
            const nextExp = currentExp + gainedExp;
            const nextLevel = calculateLevel(nextExp);
            const yesterday = getYesterday(today);
            const nextStreak = user.lastCompletedDate === yesterday
                ? (user.streak || 0) + 1
                : 1;
            const nextVisitedCount = (user.visitedCount || 0) + 1;
            const completedHop = {
                ...todayHop,
                completed: true,
                completedAt: today
            };
            const badgeResult = applyBadges({
                ...user,
                exp: nextExp,
                level: nextLevel,
                streak: nextStreak,
                visitedCount: nextVisitedCount
            });

            transaction.update(userRef, {
                todayHop: completedHop,
                exp: nextExp,
                level: nextLevel,
                streak: nextStreak,
                visitedCount: nextVisitedCount,
                lastCompletedDate: today,
                badges: badgeResult.badges
            });

            return {
                status: 200,
                body: {
                    success: true,
                    hop: completedHop,
                    alreadyCompleted: false,
                    gainedExp,
                    levelUp: nextLevel > currentLevel,
                    userStatus: {
                        exp: nextExp,
                        level: nextLevel,
                        streak: nextStreak,
                        visitedCount: nextVisitedCount
                    },
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

exports.createReview = async (req, res) => {
    try {

        const uid = req.params.uid;
        const { rating, comment = "", mood = "" } = req.body;
        const parsedRating = validateRating(rating);

        if (!parsedRating) {
            return res.status(400).json({
                success: false,
                message: "ratingは1〜5の整数で指定してください"
            });
        }

        const userRef = db.collection("users").doc(uid);
        const today = getToday();

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
            const todayHop = user.todayHop;

            if (!todayHop || todayHop.createdAt !== today) {
                return {
                    status: 400,
                    body: {
                        success: false,
                        message: "今日のHopがまだ生成されていません"
                    }
                };
            }

            if (!todayHop.completed) {
                return {
                    status: 400,
                    body: {
                        success: false,
                        message: "Hop達成後にレビューできます"
                    }
                };
            }

            const review = {
                date: today,
                hopTitle: todayHop.title,
                category: todayHop.category,
                rating: parsedRating,
                comment: String(comment).trim(),
                mood: String(mood).trim(),
                createdAt: getNow()
            };
            const reviews = Array.isArray(user.reviews) ? user.reviews : [];
            const reviewIndex = reviews.findIndex((item) => item.date === today);
            const nextReviews = [...reviews];

            if (reviewIndex >= 0) {
                nextReviews[reviewIndex] = review;
            } else {
                nextReviews.push(review);
            }

            const reviewedHop = {
                ...todayHop,
                review
            };
            const badgeResult = applyBadges({
                ...user,
                reviews: nextReviews
            });

            transaction.update(userRef, {
                todayHop: reviewedHop,
                reviews: nextReviews,
                badges: badgeResult.badges
            });

            return {
                status: 200,
                body: {
                    success: true,
                    review,
                    hop: reviewedHop,
                    updated: reviewIndex >= 0,
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

exports.getReviews = async (req, res) => {
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
        const reviews = Array.isArray(user.reviews) ? user.reviews : [];

        res.json({
            success: true,
            reviews: reviews.slice().reverse()
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
};
