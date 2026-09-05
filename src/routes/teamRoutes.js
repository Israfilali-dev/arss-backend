const express = require("express");
const {
  listTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} = require("../controllers/teamController");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", listTeam); // public
router.post("/", requireAuth, upload.single("photo"), createTeamMember);
router.put("/:id", requireAuth, upload.single("photo"), updateTeamMember);
router.delete("/:id", requireAuth, deleteTeamMember);

module.exports = router;
