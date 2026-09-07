const validateCreateComplaint = (complaintData) => {

    const {
        title,
        description,
        category,
        // severity,
        latitude,
        longitude,
        estimated_area_sqm,
        estimated_length_m,
        estimated_width_m,
        measured_via_ar
    } = complaintData;

    // =========================
    // Required fields
    // =========================
    if (
        !title ||
        !description ||
        !category ||
        // !severity ||
        latitude === undefined ||
        latitude === null ||
        longitude === undefined ||
        longitude === null
    ) {
        throw new Error("All required fields must be provided.");
    }

    // =========================
    // Title validation
    // =========================
    if (
        typeof title !== "string" ||
        title.trim().length < 5
    ) {
        throw new Error("Title must be at least 5 characters.");
    }

    // =========================
    // Description validation
    // =========================
    if (
        typeof description !== "string" ||
        description.trim().length < 10
    ) {
        throw new Error(
            "Description must be at least 10 characters."
        );
    }

    // =========================
    // Category validation
    // =========================
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

    // =========================
    // Severity validation
    // =========================
    
    // =========================
    // Convert location values
    // =========================
    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    // =========================
    // Latitude validation
    // =========================
    if (
        !Number.isFinite(latitudeNumber) ||
        latitudeNumber < -90 ||
        latitudeNumber > 90
    ) {
        throw new Error(
            "Latitude must be between -90 and 90."
        );
    }

    // =========================
    // Longitude validation
    // =========================
    if (
        !Number.isFinite(longitudeNumber) ||
        longitudeNumber < -180 ||
        longitudeNumber > 180
    ) {
        throw new Error(
            "Longitude must be between -180 and 180."
        );
    }

    // =========================
    // Estimated Area
    // =========================
    let area = null;

    if (
        estimated_area_sqm !== undefined &&
        estimated_area_sqm !== null &&
        estimated_area_sqm !== ""
    ) {
        area = Number(estimated_area_sqm);

        if (
            !Number.isFinite(area) ||
            area < 0
        ) {
            throw new Error("Invalid estimated area.");
        }
    }

    // =========================
    // Estimated Length
    // =========================
    let length = null;

    if (
        estimated_length_m !== undefined &&
        estimated_length_m !== null &&
        estimated_length_m !== ""
    ) {
        length = Number(estimated_length_m);

        if (
            !Number.isFinite(length) ||
            length < 0
        ) {
            throw new Error("Invalid estimated length.");
        }
    }

    // =========================
    // Estimated Width
    // =========================
    let width = null;

    if (
        estimated_width_m !== undefined &&
        estimated_width_m !== null &&
        estimated_width_m !== ""
    ) {
        width = Number(estimated_width_m);

        if (
            !Number.isFinite(width) ||
            width < 0
        ) {
            throw new Error("Invalid estimated width.");
        }
    }

    // =========================
    // AR Measurement Flag
    // =========================
    let measuredViaAr = false;

    if (
        measured_via_ar !== undefined &&
        measured_via_ar !== null &&
        measured_via_ar !== ""
    ) {

        if (
            measured_via_ar !== true &&
            measured_via_ar !== false &&
            measured_via_ar !== "true" &&
            measured_via_ar !== "false"
        ) {
            throw new Error("Invalid AR measurement flag.");
        }

        measuredViaAr =
            measured_via_ar === true ||
            measured_via_ar === "true";
    }

    // =========================
    // Return normalized data
    // =========================
    return {
        title: title.trim(),
        description: description.trim(),
        category,
        latitude: latitudeNumber,
        longitude: longitudeNumber,
        estimated_area_sqm: area,
        estimated_length_m: length,
        estimated_width_m: width,
        measured_via_ar: measuredViaAr
    };
};

module.exports = {
    validateCreateComplaint
};