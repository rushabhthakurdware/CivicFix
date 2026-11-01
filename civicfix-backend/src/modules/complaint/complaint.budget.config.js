
/**
 * CivicFix — Complaint Budget Configuration
 *
 * IMPORTANT:
 * All amounts below are ILLUSTRATIVE PLACEHOLDERS.
 * They are NOT verified CPWD, Maharashtra PWD, or
 * municipal schedule-of-rates figures.
 *
 * Replace these values with applicable official rates
 * before using the estimates for real financial decisions.
 *
 * Currency: INR
 */

const COMPLAINT_BUDGET_CONFIG = {
    currency: "INR",

    /**
     * Area-based categories:
     * estimated cost = rate per square metre × area
     *
     * minimumCostInr prevents unrealistically small estimates.
     *
     * PLACEHOLDER VALUES — replace with official rates.
     */
    areaBasedRates: {
        POTHOLE: {
            ratePerSqmInr: 1500,
            minimumCostInr: 1000
        },

        ROAD_DAMAGE: {
            ratePerSqmInr: 2500,
            minimumCostInr: 2000
        },

        SEWAGE: {
            ratePerSqmInr: 1800,
            minimumCostInr: 1500
        }
    },

    /**
     * Flat estimates used when a category is not area-based,
     * or when an area-based complaint has no valid area.
     *
     * PLACEHOLDER VALUES — replace with official estimates.
     */
    flatRatesInr: {
        POTHOLE: 1000,
        ROAD_DAMAGE: 2000,
        SEWAGE: 1500,
        STREET_LIGHT: 5000,
        UTILITY_POLE: 10000,
        OTHER: 1000
    }
};

module.exports = {
    COMPLAINT_BUDGET_CONFIG
};
