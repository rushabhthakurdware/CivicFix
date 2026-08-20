const validateCreateComplaint = (complaintData) => {

    const {
        title,
        description,
        category,
        severity,
        latitude,
        longitude
    } = complaintData;


    // Required fields
    if (
        !title ||
        !description ||
        !category ||
        !severity ||
        latitude === undefined ||
        longitude === undefined
    ) {
        throw new Error("All required fields must be provided.");
    }


    // Title validation
    if (typeof title !== "string" || title.trim().length < 5) {
        throw new Error("Title must be at least 5 characters.");
    }


    // Description validation
    if (
        typeof description !== "string" ||
        description.trim().length < 10
    ) {
        throw new Error(
            "Description must be at least 10 characters."
        );
    }


    // Category validation
    const validCategories = [
        "POTHOLE",
        "SEWAGE",
        "UTILITY_POLE",
        "ROAD_DAMAGE",
        "STREET_LIGHT",
        "OTHER"
    ];

    if (!validCategories.includes(category)) {
        throw new Error("Invalid complaint category.");
    }


    // Severity validation
    const validSeverities = [
        "LOW",
        "MEDIUM",
        "HIGH"
    ];

    if (!validSeverities.includes(severity)) {
        throw new Error("Invalid severity level.");
    }


    // Convert location values to numbers
    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);


    // Check if latitude is a valid number
    if (
        Number.isNaN(latitudeNumber) ||
        latitudeNumber < -90 ||
        latitudeNumber > 90
    ) {
        throw new Error(
            "Latitude must be between -90 and 90."
        );
    }


    // Check if longitude is a valid number
    if (
        Number.isNaN(longitudeNumber) ||
        longitudeNumber < -180 ||
        longitudeNumber > 180
    ) {
        throw new Error(
            "Longitude must be between -180 and 180."
        );
    }


    return true;
};


module.exports = {
    validateCreateComplaint
};