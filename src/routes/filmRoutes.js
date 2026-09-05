const express = require("express");
const {
  listPublicFilms,
  listAdminFilms,
  getFilm,
  createFilm,
  updateFilm,
  deleteFilm,
} = require("../controllers/filmController");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.get("/", listPublicFilms); // public — published only
router.get("/admin", requireAuth, listAdminFilms); // admin — all statuses
router.get("/:id", getFilm);
router.post("/", requireAuth, upload.single("poster"), createFilm);
router.put("/:id", requireAuth, upload.single("poster"), updateFilm);
router.delete("/:id", requireAuth, deleteFilm);

module.exports = router;
