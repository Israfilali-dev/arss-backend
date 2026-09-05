const express = require("express");
const {
  listGallery,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} = require("../controllers/galleryController");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", listGallery); // public
router.post("/", requireAuth, upload.single("image"), addGalleryImage);
router.put("/:id", requireAuth, updateGalleryImage);
router.delete("/:id", requireAuth, deleteGalleryImage);

module.exports = router;
