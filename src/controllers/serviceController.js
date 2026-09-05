const { Service } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const listServices = asyncHandler(async (req, res) => {
  const services = await Service.findAll({ order: [["order", "ASC"], ["createdAt", "ASC"]] });
  res.json(services);
});

const createService = asyncHandler(async (req, res) => {
  const { title, description, icon, order } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required." });

  const service = await Service.create({
    title,
    description,
    icon,
    order: order ? Number(order) : 0,
  });

  res.status(201).json(service);
});

const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found." });

  const { title, description, icon, order } = req.body;
  await service.update({
    title: title ?? service.title,
    description: description ?? service.description,
    icon: icon ?? service.icon,
    order: order === undefined ? service.order : Number(order),
  });

  res.json(service);
});

const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByPk(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found." });
  await service.destroy();
  res.json({ message: "Service deleted." });
});

module.exports = { listServices, createService, updateService, deleteService };
