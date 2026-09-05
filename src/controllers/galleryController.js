const { GalleryImage } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { uploadBufferToCloudinary, destroyCloudinaryImage } = require("../middleware/upload");

const listGallery = asyncHandler(async (req, res) => {
  const images = await GalleryImage.findAll({ order: [["order", "ASC"], ["createdAt", "DESC"]] });
  res.json(images);
});

const addGalleryImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image file was uploaded." });

  const result = await uploadBufferToCloudinary(req.file.buffer, "arss/gallery");
  const { caption, order } = req.body;

  const image = await GalleryImage.create({
    url: result.secure_url,
    cloudinaryId: result.public_id,
    caption,
    order: order ? Number(order) : 0,
  });

  res.status(201).json(image);
});

const updateGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findByPk(req.params.id);
  if (!image) return res.status(404).json({ message: "Gallery image not found." });

  const { caption, order } = req.body;
  await image.update({
    caption: caption ?? image.caption,
    order: order === undefined ? image.order : Number(order),
  });

  res.json(image);
});

const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await GalleryImage.findByPk(req.params.id);
  if (!image) return res.status(404).json({ message: "Gallery image not found." });

  await destroyCloudinaryImage(image.cloudinaryId);
  await image.destroy();

  res.json({ message: "Gallery image deleted." });
});

module.exports = { listGallery, addGalleryImage, updateGalleryImage, deleteGalleryImage };
