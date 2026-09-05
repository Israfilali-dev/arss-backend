const express = require("express");
const {
  createEnquiry,
  listEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} = require("../controllers/enquiryController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", createEnquiry); // public — the contact form
router.get("/", requireAuth, listEnquiries);
router.put("/:id/status", requireAuth, updateEnquiryStatus);
router.delete("/:id", requireAuth, deleteEnquiry);

module.exports = router;
