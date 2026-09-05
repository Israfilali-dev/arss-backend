const { Enquiry } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

// Public: anyone can submit an enquiry from the contact form.
const createEnquiry = asyncHandler(async (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ message: "Name, phone and message are required." });
  }

  const enquiry = await Enquiry.create({ name, phone, email, message });
  res.status(201).json({ message: "Enquiry sent — we'll be in touch.", enquiry });
});

// Admin only below this line.
const listEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await Enquiry.findAll({ order: [["createdAt", "DESC"]] });
  res.json(enquiries);
});

const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByPk(req.params.id);
  if (!enquiry) return res.status(404).json({ message: "Enquiry not found." });

  const { status } = req.body;
  if (!["new", "read", "archived"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  await enquiry.update({ status });
  res.json(enquiry);
});

const deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByPk(req.params.id);
  if (!enquiry) return res.status(404).json({ message: "Enquiry not found." });
  await enquiry.destroy();
  res.json({ message: "Enquiry deleted." });
});

module.exports = { createEnquiry, listEnquiries, updateEnquiryStatus, deleteEnquiry };
