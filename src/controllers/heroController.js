const { HeroContent } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { uploadBufferToCloudinary, destroyCloudinaryImage } = require("../middleware/upload");

async function getOrCreate() {
  const [hero] = await HeroContent.findOrCreate({ where: { id: 1 } });
  return hero;
}

const getHero = asyncHandler(async (req, res) => {
  const hero = await getOrCreate();
  res.json(hero);
});

// Updates the text fields only (headline, subheadline, CTAs, stats).
const updateHero = asyncHandler(async (req, res) => {
  const hero = await getOrCreate();
  const {
    headline,
    subheadline,
    ctaPrimaryText,
    ctaPrimaryLink,
    ctaSecondaryText,
    ctaSecondaryLink,
    statFilms,
    statYears,
    statAwards,
  } = req.body;

  await hero.update({
    headline,
    subheadline,
    ctaPrimaryText,
    ctaPrimaryLink,
    ctaSecondaryText,
    ctaSecondaryLink,
    statFilms,
    statYears,
    statAwards,
  });

  res.json(hero);
});

// Adds one image to the hero collage (multipart/form-data, field name "image").
const addHeroImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file was uploaded." });
  }
  const hero = await getOrCreate();
  const result = await uploadBufferToCloudinary(req.file.buffer, "arss/hero");

  const heroImages = [...(hero.heroImages || [])];
  heroImages.push({
    url: result.secure_url,
    cloudinaryId: result.public_id,
    order: heroImages.length,
  });

  await hero.update({ heroImages });
  res.status(201).json(hero);
});

// Removes one hero image by its Cloudinary id.
const removeHeroImage = asyncHandler(async (req, res) => {
  const hero = await getOrCreate();
  const { cloudinaryId } = req.params;

  const target = (hero.heroImages || []).find((img) => img.cloudinaryId === cloudinaryId);
  if (!target) {
    return res.status(404).json({ message: "Hero image not found." });
  }

  await destroyCloudinaryImage(cloudinaryId);
  const heroImages = (hero.heroImages || []).filter((img) => img.cloudinaryId !== cloudinaryId);
  await hero.update({ heroImages });

  res.json(hero);
});

module.exports = { getHero, updateHero, addHeroImage, removeHeroImage };
