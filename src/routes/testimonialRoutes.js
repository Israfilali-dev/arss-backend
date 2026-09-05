const express = require("express");
const {
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", listTestimonials); // public
router.post("/", requireAuth, upload.single("photo"), createTestimonial);
router.put("/:id", requireAuth, upload.single("photo"), updateTestimonial);
router.delete("/:id", requireAuth, deleteTestimonial);

module.exports = router;
