const express = require("express");

const router = express.Router();

const authRoutes = require("../modules/auth/auth.routes");
const complaintRoutes = require("../modules/complaint/complaint.routes");
const notificationRoutes = require("../modules/notifications/notification.routes");

router.use("/notifications", notificationRoutes);
router.use("/auth", authRoutes);
router.use("/complaints", complaintRoutes);

module.exports = router;