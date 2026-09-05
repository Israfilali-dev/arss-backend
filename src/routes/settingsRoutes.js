const express = require("express");
const { getSettings, updateSettings, updateLogo } = require("../controllers/settingsController");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", getSettings); // public
router.put("/", requireAuth, updateSettings);
router.post("/logo", requireAuth, upload.single("logo"), updateLogo);

module.exports = router;
