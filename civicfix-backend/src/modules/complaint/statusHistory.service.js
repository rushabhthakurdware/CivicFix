const statusHistoryRepository = require("./statusHistory.repository");
const complaintRepository = require("./complaint.repository");


// Allowed status transitions
const allowedTransitions = {
    SUBMITTED: ["UNDER_REVIEW"],
    UNDER_REVIEW: ["ASSIGNED"],
    ASSIGNED: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED"],
    RESOLVED: ["CLOSED"],
    CLOSED: []
};


// Change complaint status
const changeComplaintStatus = async ({
    complaintId,
    newStatus,
    changedBy,
    comment
}) => {

    // Get complaint
    const complaint = await complaintRepository.getComplaintByDatabaseId(
        complaintId
    );

    if (!complaint) {
        throw new Error("Complaint not found.");
    }


    const oldStatus = complaint.status;


    // Check whether status transition is allowed
    const allowedNextStatuses = allowedTransitions[oldStatus];

    if (!allowedNextStatuses) {
        throw new Error("Invalid current complaint status.");
    }


    if (!allowedNextStatuses.includes(newStatus)) {
        throw new Error(
            `Cannot change status from ${oldStatus} to ${newStatus}.`
        );
    }


    // Update complaint status
    const updatedComplaint =
        await complaintRepository.updateComplaintStatus(
            complaintId,
            newStatus
        );


    // Create status history
    const history =
        await statusHistoryRepository.createStatusHistory({
            complaintId,
            oldStatus,
            newStatus,
            changedBy,
            comment
        });


    return {
        complaint: updatedComplaint,
        history
    };
};


// Get complaint status history
const getComplaintStatusHistory = async (complaintId) => {

    const complaint =
        await complaintRepository.getComplaintByDatabaseId(
            complaintId
        );

    if (!complaint) {
        throw new Error("Complaint not found.");
    }


    return await statusHistoryRepository
        .getStatusHistoryByComplaintId(complaintId);
};


module.exports = {
    changeComplaintStatus,
    getComplaintStatusHistory
};