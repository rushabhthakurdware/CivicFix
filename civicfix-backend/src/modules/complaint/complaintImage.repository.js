const { pool } = require("../../config/db");

const createComplaintImage = async (
    complaintId,
    imageUrl,
    publicId
) => {

    const query = `
        INSERT INTO complaint_images (
            complaint_id,
            image_url,
            public_id
        )
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const values = [
        complaintId,
        imageUrl,
        publicId
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

module.exports = {
    createComplaintImage
};