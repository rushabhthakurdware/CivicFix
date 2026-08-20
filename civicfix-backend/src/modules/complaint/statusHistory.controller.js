const statusHistoryService = require("./statusHistory.service");


// Change complaint status
const changeComplaintStatus = async (req, res) => {

    try {

        const { complaintId } = req.params;

        const {
            newStatus,
            comment
        } = req.body;


        // Get logged-in user from JWT middleware
        const changedBy = req.user.id;


        const result =
            await statusHistoryService.changeComplaintStatus({
                complaintId: Number(complaintId),
                newStatus,
                changedBy,
                comment
            });


        return res.status(200).json({
            success: true,
            message: "Complaint status updated successfully.",
            data: result
        });

    } catch (error) {

        console.error(
            "Change Status Error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// Get complaint status history
const getComplaintStatusHistory = async (req, res) => {

    try {

        const { complaintId } = req.params;

        const history =
            await statusHistoryService
                .getComplaintStatusHistory(
                    Number(complaintId)
                );


        return res.status(200).json({
            success: true,
            message: "Complaint status history fetched successfully.",
            data: history
        });

    } catch (error) {

        console.error(
            "Get Status History Error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    changeComplaintStatus,
    getComplaintStatusHistory
};