const express = require("express");

const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const complaintRoutes = require("../modules/complaint/complaint.routes");

router.use("/auth", authRoutes);
router.use("/complaints", complaintRoutes);
module.exports = router;