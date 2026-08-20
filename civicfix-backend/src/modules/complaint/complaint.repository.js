const { pool } = require("../../config/db");

const createComplaint = async (complaintData) => {

    const {
        complaintId,
        citizenId,
        title,
        description,
        category,
        severity,
        latitude,
        longitude,
        address
    } = complaintData;

    const query = `
        INSERT INTO complaints (
            complaint_id,
            citizen_id,
            title,
            description,
            category,
            severity,
            latitude,
            longitude,
            address
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
    `;

    const values = [
        complaintId,
        citizenId,
        title,
        description,
        category,
        severity,
        latitude,
        longitude,
        address
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const getComplaintsByCitizen = async (citizenId) => {

    const query = `
        SELECT *
        FROM complaints
        WHERE citizen_id = $1
        ORDER BY created_at DESC;
    `;

    const values = [citizenId];

    const result = await pool.query(query, values);

    return result.rows;
};

const getComplaintByDatabaseId = async (complaintId) => {

    const query = `
        SELECT *
        FROM complaints
        WHERE id = $1;
    `;

    // const values = [
    //     complaintId,
    //     citizenId
    // ];

    const result = await pool.query(query, [complaintId]);

    return result.rows[0];
};

const updateComplaintStatus = async (complaintId, status) => {

    const query = `
        UPDATE complaints
        SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [
        status,
        complaintId
    ]);

    return result.rows[0];
};
module.exports = {
    createComplaint,
    getComplaintsByCitizen,
    getComplaintByDatabaseId    ,
    updateComplaintStatus
};