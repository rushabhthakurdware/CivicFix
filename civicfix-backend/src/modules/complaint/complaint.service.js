const complaintRepository = require("./complaint.repository");
const complaintImageRepository = require("./complaintImage.repository");

const {
    validateCreateComplaint
} = require("./complaint.validation");

const { uploadImage } = require("../../utils/cloudinary");

const {
    calculateComplaintSeverity
} = require("./complaint.scoring");

const createComplaint = async (complaintData, citizenId, file) => {

    // Convert form-data values into proper numbers
    const dataToValidate = {
        ...complaintData,
        latitude: Number(complaintData.latitude),
        longitude: Number(complaintData.longitude)
    };

   
// Validate complaint data
    validateCreateComplaint(dataToValidate);
    
const scoringResult = calculateComplaintSeverity({
    category: complaintData.category,
    estimatedAreaSqm: Number(
        complaintData.estimated_area_sqm
    ) || 0,
    title: complaintData.title,
    description: complaintData.description
});

    

    // Image is required
    if (!file) {
        throw new Error("Complaint image is required.");
    }

    // Generate complaint ID
    const year = new Date().getFullYear();

    const complaintId = `CFX-${year}-${Date.now()}`;

    // Upload image to Cloudinary
    const uploadedImage = await uploadImage(file.buffer);

    // Prepare complaint data
    const data = {
    complaintId,
    citizenId,
    title: complaintData.title.trim(),
    description: complaintData.description.trim(),
    category: complaintData.category,
    severity: scoringResult.severity,   // <-- ADD THIS
    latitude: dataToValidate.latitude,
    longitude: dataToValidate.longitude,
    address: complaintData.address || null,

    estimatedAreaSqm:
        complaintData.estimated_area_sqm !== undefined
            ? Number(complaintData.estimated_area_sqm)
            : null,

    estimatedLengthM:
        complaintData.estimated_length_m !== undefined
            ? Number(complaintData.estimated_length_m)
            : null,

    estimatedWidthM:
        complaintData.estimated_width_m !== undefined
            ? Number(complaintData.estimated_width_m)
            : null,

    measuredViaAr:
        complaintData.measured_via_ar === "true" ||
        complaintData.measured_via_ar === true
};

    // Create complaint in PostgreSQL
    const complaint =
        await complaintRepository.createComplaint(data);

    // Save Cloudinary information in PostgreSQL
    const image =
        await complaintImageRepository.createComplaintImage(
            complaint.id,
            uploadedImage.secure_url,
            uploadedImage.public_id
        );

    return {
        complaint,
        image
    };
};


const getComplaintsByCitizen = async (citizenId) => {

    return await complaintRepository.getComplaintsByCitizen(
        citizenId
    );

};


const getComplaintByDatabaseId = async (id, citizenId) => {

    const complaint =
        await complaintRepository.getComplaintByDatabaseId(
            id,
            citizenId
        );

    if (!complaint) {
        throw new Error("Complaint not found.");
    }

    return complaint;
};

const getAllComplaintsForOfficer = async (filters) => {

    return await complaintRepository.getAllComplaintsForOfficer(
        filters
    );

};

const getComplaintDetailsForOfficer = async (complaintId) => {

    const result =
        await complaintRepository.getComplaintDetailsForOfficer(
            complaintId
        );

    if (!result) {
        throw new Error("Complaint not found.");
    }

    return result;
};
module.exports = {
    createComplaint,
    getComplaintsByCitizen,
    getComplaintByDatabaseId,
    getAllComplaintsForOfficer,
    getComplaintDetailsForOfficer
};