const notificationRepository = require("./notification.repository");

const createResolutionNotification = async ({
    citizenId,
    complaintId,
    complaintTitle,
    comment
}) => {

    return await notificationRepository.createNotification({
        citizenId,
        complaintId,
        title: "Complaint Resolved",
        message:
            `Your complaint "${complaintTitle}" has been resolved. ` +
            `Officer update: ${comment}`
    });
};

const getNotificationsByCitizen = async (citizenId) => {

    return await notificationRepository.getNotificationsByCitizen(
        citizenId
    );
};

module.exports = {
    createResolutionNotification,
    getNotificationsByCitizen
};