const { SiteSettings } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { uploadBufferToCloudinary, destroyCloudinaryImage } = require("../middleware/upload");

async function getOrCreate() {
  const [settings] = await SiteSettings.findOrCreate({ where: { id: 1 } });
  return settings;
}

const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate();
  res.json(settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate();
  const { siteName, tagline, facebook, instagram, youtube, twitter, whatsapp } = req.body;

  await settings.update({
    siteName: siteName ?? settings.siteName,
    tagline: tagline ?? settings.tagline,
    socialLinks: {
      ...settings.socialLinks,
      ...(facebook !== undefined && { facebook }),
      ...(instagram !== undefined && { instagram }),
      ...(youtube !== undefined && { youtube }),
      ...(twitter !== undefined && { twitter }),
      ...(whatsapp !== undefined && { whatsapp }),
    },
  });

  res.json(settings);
});

// Replaces the site logo (multipart/form-data, field name "logo").
const updateLogo = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No logo file was uploaded." });

  const settings = await getOrCreate();
  const result = await uploadBufferToCloudinary(req.file.buffer, "arss/branding");
  await destroyCloudinaryImage(settings.logoCloudinaryId);

  await settings.update({
    logoUrl: result.secure_url,
    logoCloudinaryId: result.public_id,
  });

  res.json(settings);
});

module.exports = { getSettings, updateSettings, updateLogo };
