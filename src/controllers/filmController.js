const { Film } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { uploadBufferToCloudinary, destroyCloudinaryImage } = require("../middleware/upload");

// Public: only published films, newest-order first.
const listPublicFilms = asyncHandler(async (req, res) => {
  const films = await Film.findAll({
    where: { status: "published" },
    order: [["order", "ASC"], ["createdAt", "DESC"]],
  });
  res.json(films);
});

// Admin: every film regardless of status.
const listAdminFilms = asyncHandler(async (req, res) => {
  const films = await Film.findAll({ order: [["order", "ASC"], ["createdAt", "DESC"]] });
  res.json(films);
});

const getFilm = asyncHandler(async (req, res) => {
  const film = await Film.findByPk(req.params.id);
  if (!film) return res.status(404).json({ message: "Film not found." });
  res.json(film);
});

// Creates a film. Accepts multipart/form-data with an optional "poster" file.
const createFilm = asyncHandler(async (req, res) => {
  const { title, category, year, description, featured, status, order } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  let posterUrl = null;
  let posterCloudinaryId = null;
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "arss/films");
    posterUrl = result.secure_url;
    posterCloudinaryId = result.public_id;
  }

  const film = await Film.create({
    title,
    category,
    year,
    description,
    featured: featured === "true" || featured === true,
    status: status || "published",
    order: order ? Number(order) : 0,
    posterUrl,
    posterCloudinaryId,
  });

  res.status(201).json(film);
});

// Updates a film. If a new "poster" file is sent, the old Cloudinary image is removed.
const updateFilm = asyncHandler(async (req, res) => {
  const film = await Film.findByPk(req.params.id);
  if (!film) return res.status(404).json({ message: "Film not found." });

  const { title, category, year, description, featured, status, order } = req.body;

  let posterUrl = film.posterUrl;
  let posterCloudinaryId = film.posterCloudinaryId;

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "arss/films");
    await destroyCloudinaryImage(film.posterCloudinaryId);
    posterUrl = result.secure_url;
    posterCloudinaryId = result.public_id;
  }

  await film.update({
    title: title ?? film.title,
    category: category ?? film.category,
    year: year ?? film.year,
    description: description ?? film.description,
    featured: featured === undefined ? film.featured : featured === "true" || featured === true,
    status: status ?? film.status,
    order: order === undefined ? film.order : Number(order),
    posterUrl,
    posterCloudinaryId,
  });

  res.json(film);
});

const deleteFilm = asyncHandler(async (req, res) => {
  const film = await Film.findByPk(req.params.id);
  if (!film) return res.status(404).json({ message: "Film not found." });

  await destroyCloudinaryImage(film.posterCloudinaryId);
  await film.destroy();

  res.json({ message: "Film deleted." });
});

module.exports = {
  listPublicFilms,
  listAdminFilms,
  getFilm,
  createFilm,
  updateFilm,
  deleteFilm,
};
