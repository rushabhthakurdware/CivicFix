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

module.exports = {
    getMyNotifications
};