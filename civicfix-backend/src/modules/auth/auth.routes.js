const express = require("express");

const router = express.Router();

const authController = require("./auth.controller");

const authenticate = require("../../middleware/auth.middleware");

router.get(
    "/profile",
    authenticate,
    (req, res) => {

        res.json({
            success:true,
            user:req.user
        });

    }
);

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;