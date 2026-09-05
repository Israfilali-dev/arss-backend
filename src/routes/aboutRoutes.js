const express = require("express");
const { getAbout, updateAbout } = require("../controllers/aboutController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAbout); // public
router.put("/", requireAuth, updateAbout);

module.exports = router;
