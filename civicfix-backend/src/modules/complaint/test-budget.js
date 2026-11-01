
const {
    calculateEstimatedBudget
} = require("./complaint.budget");

const testCases = [
    {
        name: "Pothole with area",
        input: {
            category: "POTHOLE",
            estimatedAreaSqm: 2
        },
        expected: 3000
    },
    {
        name: "Road damage below minimum",
        input: {
            category: "ROAD_DAMAGE",
            estimatedAreaSqm: 0.5
        },
        expected: 2000
    },
    {
        name: "Street light uses flat rate",
        input: {
            category: "STREET_LIGHT",
            estimatedAreaSqm: 10
        },
        expected: 5000
    },
    {
        name: "Pothole with missing area",
        input: {
            category: "POTHOLE",
            estimatedAreaSqm: null
        },
        expected: 1000
    }
];

for (const test of testCases) {
    const result = calculateEstimatedBudget(test.input);

    console.log(
        `${test.name}:`,
        result.estimatedBudgetInr === test.expected
            ? "PASS"
            : `FAIL (got ${result.estimatedBudgetInr})`,
        result
    );
}
