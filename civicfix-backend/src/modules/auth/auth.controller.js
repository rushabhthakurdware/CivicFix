const authService = require("./auth.service");

const register = async (req, res) => {
    try {

        console.log("Request Body:", req.body);
        const result = await authService.register(req.body);

        return res.status(201).json({
            success: true,
            message: result.message,
            data: result.user
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

const login = async (req, res) => {
        console.log(req.user);
    try {

        const result = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                token: result.token,
                user: result.user
            }
        });

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    register,
    login   
};