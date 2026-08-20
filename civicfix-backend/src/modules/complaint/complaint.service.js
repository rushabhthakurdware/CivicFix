const complaintRepository = require("./complaint.repository");
const complaintImageRepository = require("./complaintImage.repository");

const {
    validateCreateComplaint
} = require("./complaint.validation");

const { uploadImage } = require("../../utils/cloudinary");


const createComplaint = async (complaintData, citizenId, file) => {

    // Convert form-data values into proper numbers
    const dataToValidate = {
        ...complaintData,
        latitude: Number(complaintData.latitude),
        longitude: Number(complaintData.longitude)
    };

    // Validate complaint data
    validateCreateComplaint(dataToValidate);

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
        severity: complaintData.severity,
        latitude: dataToValidate.latitude,
        longitude: dataToValidate.longitude,
        address: complaintData.address || null
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


const getComplaintById = async (complaintId, citizenId) => {

    const complaint =
        await complaintRepository.getComplaintById(
            complaintId,
            citizenId
        );

    if (!complaint) {
        throw new Error("Complaint not found.");
    }

    return complaint;
};


module.exports = {
    createComplaint,
    getComplaintsByCitizen,
    getComplaintById
};