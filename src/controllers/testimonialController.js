const { Testimonial } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { uploadBufferToCloudinary, destroyCloudinaryImage } = require("../middleware/upload");

const listTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.findAll({ order: [["order", "ASC"], ["createdAt", "DESC"]] });
  res.json(testimonials);
});

const createTestimonial = asyncHandler(async (req, res) => {
  const { name, roleOrProject, quote, order } = req.body;
  if (!name || !quote) {
    return res.status(400).json({ message: "Name and quote are required." });
  }

  let photoUrl = null;
  let photoCloudinaryId = null;
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "arss/testimonials");
    photoUrl = result.secure_url;
    photoCloudinaryId = result.public_id;
  }

  const testimonial = await Testimonial.create({
    name,
    roleOrProject,
    quote,
    order: order ? Number(order) : 0,
    photoUrl,
    photoCloudinaryId,
  });

  res.status(201).json(testimonial);
});

const updateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByPk(req.params.id);
  if (!testimonial) return res.status(404).json({ message: "Testimonial not found." });

  const { name, roleOrProject, quote, order } = req.body;
  let photoUrl = testimonial.photoUrl;
  let photoCloudinaryId = testimonial.photoCloudinaryId;

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "arss/testimonials");
    await destroyCloudinaryImage(testimonial.photoCloudinaryId);
    photoUrl = result.secure_url;
    photoCloudinaryId = result.public_id;
  }

  await testimonial.update({
    name: name ?? testimonial.name,
    roleOrProject: roleOrProject ?? testimonial.roleOrProject,
    quote: quote ?? testimonial.quote,
    order: order === undefined ? testimonial.order : Number(order),
    photoUrl,
    photoCloudinaryId,
  });

  res.json(testimonial);
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByPk(req.params.id);
  if (!testimonial) return res.status(404).json({ message: "Testimonial not found." });

  await destroyCloudinaryImage(testimonial.photoCloudinaryId);
  await testimonial.destroy();

  res.json({ message: "Testimonial deleted." });
});

module.exports = { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
