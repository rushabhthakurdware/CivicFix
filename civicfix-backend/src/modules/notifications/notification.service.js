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

const markNotificationAsRead = async (notificationId, citizenId) => {
    const notification =
        await notificationRepository.markNotificationAsRead(
            notificationId,
            citizenId
        );

    if (!notification) {
        throw new Error("Notification not found.");
    }

    return notification;
};
const getNotificationsByCitizen = async (citizenId) => {

    return await notificationRepository.getNotificationsByCitizen(
        citizenId
    );
};

module.exports = {
    createResolutionNotification,
    getNotificationsByCitizen,
    markNotificationAsRead
};