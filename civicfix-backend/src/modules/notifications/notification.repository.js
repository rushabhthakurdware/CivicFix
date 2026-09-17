const { pool } = require("../../config/db");

const createNotification = async ({
    citizenId,
    complaintId,
    title,
    message
}) => {

    const query = `
        INSERT INTO notifications (
            citizen_id,
            complaint_id,
            title,
            message
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

    const values = [
        citizenId,
        complaintId,
        title,
        message
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};
const markNotificationAsRead = async (notificationId, citizenId) => {
    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
          AND citizen_id = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [
        notificationId,
        citizenId
    ]);

    return result.rows[0];
};

const getNotificationsByCitizen = async (citizenId) => {

    const query = `
        SELECT
            n.id,
            n.complaint_id,
            n.title,
            n.message,
            n.is_read,
            n.created_at
        FROM notifications n
        WHERE n.citizen_id = $1
        ORDER BY n.created_at DESC;
    `;

    const result = await pool.query(query, [citizenId]);

    return result.rows;
};

module.exports = {
    createNotification,
    getNotificationsByCitizen,
    markNotificationAsRead
};