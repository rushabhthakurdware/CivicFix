
const {
    COMPLAINT_BUDGET_CONFIG
} = require("./complaint.budget.config");

const calculateEstimatedBudget = ({
    category,
    estimatedAreaSqm
}) => {
    const normalizedCategory = String(category || "")
        .trim()
        .toUpperCase();

    const {
        areaBasedRates,
        flatRatesInr
    } = COMPLAINT_BUDGET_CONFIG;

    // Reject unsupported categories instead of silently
    // estimating a cost for an unknown complaint type.
    if (!Object.prototype.hasOwnProperty.call(
        flatRatesInr,
        normalizedCategory
    )) {
        throw new Error("Unsupported complaint category for budget estimation.");
    }

    const flatRate = flatRatesInr[normalizedCategory];

    // Use a flat estimate if the area is missing,
    // invalid, or not positive.
    if (
        estimatedAreaSqm === null ||
        estimatedAreaSqm === undefined ||
        estimatedAreaSqm === ""
    ) {
        return {
            estimatedBudgetInr: flatRate,
            estimationMethod: "FLAT_RATE"
        };
    }

    const area = Number(estimatedAreaSqm);

    if (!Number.isFinite(area) || area <= 0) {
        return {
            estimatedBudgetInr: flatRate,
            estimationMethod: "FLAT_RATE"
        };
    }

    const areaRate = areaBasedRates[normalizedCategory];

    // Categories without area-based rates always use
    // their configured flat rate.
    if (!areaRate) {
        return {
            estimatedBudgetInr: flatRate,
            estimationMethod: "FLAT_RATE"
        };
    }

    const calculatedCost =
        area * areaRate.ratePerSqmInr;

    const estimatedBudgetInr = Math.max(
        calculatedCost,
        areaRate.minimumCostInr
    );

    return {
        estimatedBudgetInr: Number(
            estimatedBudgetInr.toFixed(2)
        ),
        estimationMethod: "AREA_RATE"
    };
};

module.exports = {
    calculateEstimatedBudget
};
