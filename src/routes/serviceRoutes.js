const express = require("express");
const {
  listServices,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", listServices); // public
router.post("/", requireAuth, createService);
router.put("/:id", requireAuth, updateService);
router.delete("/:id", requireAuth, deleteService);

module.exports = router;
