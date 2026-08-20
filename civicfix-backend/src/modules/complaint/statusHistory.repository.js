const { pool } = require("../../config/db");


// Create a status history record
const createStatusHistory = async ({
    complaintId,
    oldStatus,
    newStatus,
    changedBy,
    comment
}) => {

    const query = `
        INSERT INTO complaint_status_history
        (
            complaint_id,
            old_status,
            new_status,
            changed_by,
            comment
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const values = [
        complaintId,
        oldStatus,
        newStatus,
        changedBy,
        comment || null
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};


// Get complete status history of a complaint
const getStatusHistoryByComplaintId = async (complaintId) => {

    const query = `
        SELECT
            csh.id,
            csh.complaint_id,
            csh.old_status,
            csh.new_status,
            csh.changed_by,
            csh.comment,
            csh.created_at,
            u.full_name AS changed_by_name
        FROM complaint_status_history csh
        LEFT JOIN users u
            ON csh.changed_by = u.id
        WHERE csh.complaint_id = $1
        ORDER BY csh.created_at ASC;
    `;

    const result = await pool.query(query, [complaintId]);

    return result.rows;
};


module.exports = {
    createStatusHistory,
    getStatusHistoryByComplaintId
};