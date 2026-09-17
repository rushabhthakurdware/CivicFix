const notificationService = require("./notification.service");

const getMyNotifications = async (req, res) => {
    try {
        const citizenId = req.user.id;

        const notifications =
            await notificationService.getNotificationsByCitizen(citizenId);

        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully.",
            data: notifications
        });
    } catch (error) {
        console.error("Get Notifications Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications."
        });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = Number(req.params.notificationId);
        const citizenId = req.user.id;

        if (!Number.isInteger(notificationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID."
            });
        }

        const notification =
            await notificationService.markNotificationAsRead(
                notificationId,
                citizenId
            );

        return res.status(200).json({
            success: true,
            message: "Notification marked as read.",
            data: notification
        });
    } catch (error) {
        console.error("Mark Notification Read Error:", error.message);

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};
module.exports = {
    getMyNotifications,
    markNotificationAsRead
};