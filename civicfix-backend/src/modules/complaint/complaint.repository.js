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
    address,
    estimatedAreaSqm,
    estimatedLengthM,
    estimatedWidthM,
    measuredViaAr
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
        address,
        estimated_area_sqm,
        estimated_length_m,
        estimated_width_m,
        measured_via_ar
    )
    VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
    )
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
    address,
    estimatedAreaSqm,
    estimatedLengthM,
    estimatedWidthM,
    measuredViaAr
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

const getAllComplaintsForOfficer = async (filters = {}) => {

    const { severity, status } = filters;

    let query = `
        SELECT *
        FROM complaints
        WHERE 1 = 1
    `;

    const values = [];
    let parameterIndex = 1;

    if (severity) {
        query += ` AND severity = $${parameterIndex}`;
        values.push(severity);
        parameterIndex++;
    }

    if (status) {
        query += ` AND status = $${parameterIndex}`;
        values.push(status);
        parameterIndex++;
    }

    query += `
        ORDER BY
            CASE severity
                WHEN 'HIGH' THEN 1
                WHEN 'MEDIUM' THEN 2
                WHEN 'LOW' THEN 3
                ELSE 4
            END,
            created_at ASC;
    `;

    const result = await pool.query(query, values);

    return result.rows;
};

const getComplaintDetailsForOfficer = async (complaintId) => {

    const complaintQuery = `
        SELECT
            c.*,
            ci.image_url,
            ci.public_id
        FROM complaints c
        LEFT JOIN complaint_images ci
            ON c.id = ci.complaint_id
        WHERE c.id = $1;
    `;

    const complaintResult =
        await pool.query(complaintQuery, [complaintId]);

    if (complaintResult.rows.length === 0) {
        return null;
    }

    const historyQuery = `
        SELECT
            id,
            old_status,
            new_status,
            changed_by,
            comment,
            created_at
        FROM complaint_status_history
        WHERE complaint_id = $1
        ORDER BY created_at ASC;
    `;

    const historyResult =
        await pool.query(historyQuery, [complaintId]);

    return {
        complaint: complaintResult.rows[0],
        history: historyResult.rows
    };
};

module.exports = {
    createComplaint,
    getComplaintsByCitizen,
    getComplaintByDatabaseId    ,
    updateComplaintStatus,
    getAllComplaintsForOfficer,
    getComplaintDetailsForOfficer

};