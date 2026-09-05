const express = require("express");
const { getFooter, updateFooter } = require("../controllers/footerController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", getFooter); // public
router.put("/", requireAuth, updateFooter);

module.exports = router;
