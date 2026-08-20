const bcrypt = require("bcrypt");
const { generateToken } = require("../../utils/jwt");
const { validateLogin } = require("./auth.validation");
const authRepository = require("./auth.repository");
const { validateRegister } = require("./auth.validation");

const register = async (userData) => {

    // Step 1
    validateRegister(userData);

    // Step 2
    const existingUser = await authRepository.findUserByEmail(userData.email);

    if (existingUser) {
        throw new Error("Email already exists.");
    }

    // Step 3
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    userData.password = hashedPassword;

    // Step 4
    return await authRepository.register(userData);
};


const login = async (userData) => {

    validateLogin(userData);

    const user = await authRepository.findUserByEmail(userData.email);

    if (!user) {
        throw new Error("Invalid Email or Password");
    }

    const isMatch = await bcrypt.compare(
        userData.password,
        user.password
    );

    if (!isMatch) {
        throw new Error("Invalid Email or Password");
    }

    const token = generateToken(user);

    delete user.password;

    return {
        message: "Login Successful",
        token,
        user
    };

};
module.exports = {
    register,
    login
};