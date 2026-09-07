// complaint.scoring.js

const CATEGORY_SCORES = {
    POTHOLE: 45,
    SEWAGE: 55,
    UTILITY_POLE: 60,
    ROAD_DAMAGE: 50,
    STREET_LIGHT: 30,
    OTHER: 20
};

// Area-based bonus
const calculateAreaBonus = (area) => {
    if (area === null || area === undefined || area <= 0) {
        return 0;
    }

    if (area < 1) {
        return 0;
    }

    if (area < 3) {
        return 5;
    }

    if (area < 10) {
        return 10;
    }

    return 15;
};

// Keyword-based bonus
const KEYWORDS = [
    "danger",
    "dangerous",
    "accident",
    "injury",
    "unsafe",
    "hazard",
    "risk",
    "blocked",
    "emergency"
];

const calculateKeywordBonus = (title, description) => {

    const text = `${title || ""} ${description || ""}`.toLowerCase();

    let matchedKeywords = [];

    for (const keyword of KEYWORDS) {
        if (text.includes(keyword)) {
            matchedKeywords.push(keyword);
        }
    }

    // Keep keyword influence small
    const bonus = Math.min(matchedKeywords.length * 5, 10);

    return {
        bonus,
        matchedKeywords
    };
};

// Convert score into severity
const calculateSeverityFromScore = (score) => {

    if (score >= 70) {
        return "HIGH";
    }

    if (score >= 40) {
        return "MEDIUM";
    }

    return "LOW";
};

// Main scoring function
const calculateComplaintSeverity = ({
    category,
    estimatedAreaSqm,
    title,
    description
}) => {

    const categoryScore = CATEGORY_SCORES[category] || 20;

    const areaBonus = calculateAreaBonus(
        estimatedAreaSqm
    );

    const keywordResult = calculateKeywordBonus(
        title,
        description
    );

    const keywordBonus = keywordResult.bonus;

    const totalScore =
        categoryScore +
        areaBonus +
        keywordBonus;

    const severity =
        calculateSeverityFromScore(totalScore);

    return {
        score: totalScore,
        severity,
        breakdown: {
            categoryScore,
            areaBonus,
            keywordBonus,
            matchedKeywords: keywordResult.matchedKeywords
        }
    };
};

module.exports = {
    calculateComplaintSeverity
};