const BADGES = [
    {
        id: "first_hop",
        name: "はじめてのHop",
        description: "初めてHopを達成した",
        condition: (user) => (user.visitedCount || 0) >= 1
    },
    {
        id: "level_2",
        name: "レベル2到達",
        description: "レベル2に到達した",
        condition: (user) => (user.level || 1) >= 2
    },
    {
        id: "three_day_streak",
        name: "3日連続チャレンジ",
        description: "3日連続でHopを達成した",
        condition: (user) => (user.streak || 0) >= 3
    },
    {
        id: "first_review",
        name: "レビュー投稿",
        description: "初めてレビューを投稿した",
        condition: (user) => Array.isArray(user.reviews) && user.reviews.length >= 1
    },
    {
        id: "first_place",
        name: "初めてのスポット",
        description: "初めて行った場所を保存した",
        condition: (user) => (user.visitedPlaceCount || 0) >= 1
    },
    {
        id: "five_places",
        name: "街歩きビギナー",
        description: "5か所のスポットを保存した",
        condition: (user) => (user.visitedPlaceCount || 0) >= 5
    }
];

function normalizeBadges(badges) {
    if (!Array.isArray(badges)) return [];

    return badges
        .map((badge) => {
            if (typeof badge === "string") {
                return BADGES.find((item) => item.id === badge) || { id: badge, name: badge };
            }

            return badge;
        })
        .filter((badge) => badge?.id);
}

function applyBadges(user) {
    const currentBadges = normalizeBadges(user.badges);
    const currentBadgeIds = new Set(currentBadges.map((badge) => badge.id));
    const now = new Intl.DateTimeFormat("sv-SE", {
        timeZone: process.env.APP_TIME_ZONE || "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(new Date()).replace(" ", "T") + "+09:00";
    const newBadges = BADGES
        .filter((badge) => !currentBadgeIds.has(badge.id) && badge.condition(user))
        .map((badge) => ({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            earnedAt: now
        }));

    return {
        badges: [...currentBadges, ...newBadges],
        newBadges
    };
}

function getAllBadges() {
    return BADGES.map(({ condition, ...badge }) => badge);
}

module.exports = {
    applyBadges,
    getAllBadges
};
