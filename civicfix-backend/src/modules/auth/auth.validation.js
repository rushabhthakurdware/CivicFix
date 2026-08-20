const validator = require("validator");

const validateRegister = (userData) => {

    const { full_name, email, password, phone, role } = userData;

    if (!full_name || !email || !password || !phone || !role) {
        throw new Error("All fields are required.");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Invalid email address.");
    }

    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
    }

    if (!validator.isMobilePhone(phone, "en-IN")) {
        throw new Error("Invalid phone number.");
    }

    if (!["CITIZEN", "OFFICER", "ADMIN"].includes(role)) {
        throw new Error("Invalid role.");
    }

    return true;
};

const validateLogin = (userData) => {

    const { email, password } = userData;

    if (!email || !password) {
        throw new Error("Email and Password are required.");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Invalid Email.");
    }

    return true;
};

module.exports = {
    validateRegister,
    validateLogin
};
