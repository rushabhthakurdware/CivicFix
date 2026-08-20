const express = require("express");
const upload = require("../../middleware/upload.middleware");
const router = express.Router();
const { uploadImage } = require("../../utils/cloudinary");

const complaintController = require("./complaint.controller");

const authMiddleware = require("../../middleware/auth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const statusHistoryController =
    require("./statusHistory.controller");


 
router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    complaintController.createComplaint
);

router.get(
    "/my",
    authMiddleware,
    complaintController.getMyComplaints
);


router.get(
    "/:complaintId",
    authMiddleware,
    complaintController.getComplaintById
);

router.patch(
    "/:complaintId/status",
    authMiddleware,
    authorizeRoles("OFFICER", "ADMIN"),
    statusHistoryController.changeComplaintStatus
);

router.get(
    "/:complaintId/status-history",
    authMiddleware,
    statusHistoryController.getComplaintStatusHistory
);



module.exports = router;