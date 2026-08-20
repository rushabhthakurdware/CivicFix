const { pool } = require("../../config/db");


const findUserByEmail = async (email) => {

    const query = `
        SELECT *
        FROM users
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
};

const register = async (userData) => {

    const query = `
        INSERT INTO users
        (
            full_name,
            email,
            password,
            phone,
            role
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5
        )
        RETURNING
            id,
            full_name,
            email,
            phone,
            role,
            created_at;
    `;

    const values = [
        userData.full_name,
        userData.email,
        userData.password,
        userData.phone,
        userData.role
    ];

    const result = await pool.query(query, values);

    return {
        message: "User Registered Successfully",
        user: result.rows[0]
    };
};

module.exports = {
    register,
    findUserByEmail
};