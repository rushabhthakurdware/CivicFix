const complaintService = require("./complaint.service");

const createComplaint = async (req, res) => {

    try {

        const citizenId = req.user.id;

        const result =
            await complaintService.createComplaint(
                req.body,
                citizenId,
                req.file
            );

        return res.status(201).json({
            success: true,
            message: "Complaint Created Successfully",
            data: result
        });

    } catch (error) {

        console.error(
            "Create Complaint Error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
const getMyComplaints = async (req, res) => {

    try {

        const citizenId = req.user.id;

        const complaints =
            await complaintService.getComplaintsByCitizen(
                citizenId
            );

        return res.status(200).json({
            success: true,
            message: "Complaints Retrieved Successfully",
            data: complaints
        });

    } catch (error) {

        console.error(
            "Get My Complaints Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve complaints"
        });
    }
};

const getComplaintById = async (req, res) => {

    try {

        const citizenId = req.user.id;

        const complaintId = req.params.complaintId;

        const complaint =
            await complaintService.getComplaintById(
                complaintId,
                citizenId
            );

        return res.status(200).json({
            success: true,
            message: "Complaint Retrieved Successfully",
            data: complaint
        });

    } catch (error) {

        console.error(
            "Get Complaint Error:",
            error.message
        );

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintById
};