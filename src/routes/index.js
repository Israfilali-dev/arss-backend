const express = require("express");

const authRoutes = require("./authRoutes");
const heroRoutes = require("./heroRoutes");
const aboutRoutes = require("./aboutRoutes");
const filmRoutes = require("./filmRoutes");
const teamRoutes = require("./teamRoutes");
const galleryRoutes = require("./galleryRoutes");
const testimonialRoutes = require("./testimonialRoutes");
const serviceRoutes = require("./serviceRoutes");
const footerRoutes = require("./footerRoutes");
const settingsRoutes = require("./settingsRoutes");
const enquiryRoutes = require("./enquiryRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/hero", heroRoutes);
router.use("/about", aboutRoutes);
router.use("/films", filmRoutes);
router.use("/team", teamRoutes);
router.use("/gallery", galleryRoutes);
router.use("/testimonials", testimonialRoutes);
router.use("/services", serviceRoutes);
router.use("/footer", footerRoutes);
router.use("/settings", settingsRoutes);
router.use("/enquiries", enquiryRoutes);

module.exports = router;
