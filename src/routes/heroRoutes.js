const express = require("express");
const { getHero, updateHero, addHeroImage, removeHeroImage } = require("../controllers/heroController");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", getHero); // public
router.put("/", requireAuth, updateHero);
router.post("/images", requireAuth, upload.single("image"), addHeroImage);
// cloudinaryId contains slashes (folder/filename) — the frontend must
// encodeURIComponent() it before building this URL, e.g. /images/arss%2Fhero%2Fabc123
router.delete("/images/:cloudinaryId", requireAuth, removeHeroImage);

module.exports = router;
