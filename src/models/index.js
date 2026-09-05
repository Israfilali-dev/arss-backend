const sequelize = require("../config/db");

const User = require("./User");
const HeroContent = require("./HeroContent");
const AboutContent = require("./AboutContent");
const Film = require("./Film");
const TeamMember = require("./TeamMember");
const GalleryImage = require("./GalleryImage");
const Testimonial = require("./Testimonial");
const Service = require("./Service");
const FooterContent = require("./FooterContent");
const SiteSettings = require("./SiteSettings");
const Enquiry = require("./Enquiry");

// No cross-table associations are needed — every section is independent,
// which keeps the admin panel simple and each content type easy to reason about.

module.exports = {
  sequelize,
  User,
  HeroContent,
  AboutContent,
  Film,
  TeamMember,
  GalleryImage,
  Testimonial,
  Service,
  FooterContent,
  SiteSettings,
  Enquiry,
};
