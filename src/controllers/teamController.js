const { TeamMember } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { uploadBufferToCloudinary, destroyCloudinaryImage } = require("../middleware/upload");

const listTeam = asyncHandler(async (req, res) => {
  const team = await TeamMember.findAll({ order: [["order", "ASC"], ["createdAt", "ASC"]] });
  res.json(team);
});

const createTeamMember = asyncHandler(async (req, res) => {
  const { name, role, bio, order } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required." });

  let photoUrl = null;
  let photoCloudinaryId = null;
  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "arss/team");
    photoUrl = result.secure_url;
    photoCloudinaryId = result.public_id;
  }

  const member = await TeamMember.create({
    name,
    role,
    bio,
    order: order ? Number(order) : 0,
    photoUrl,
    photoCloudinaryId,
  });

  res.status(201).json(member);
});

const updateTeamMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findByPk(req.params.id);
  if (!member) return res.status(404).json({ message: "Team member not found." });

  const { name, role, bio, order } = req.body;
  let photoUrl = member.photoUrl;
  let photoCloudinaryId = member.photoCloudinaryId;

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, "arss/team");
    await destroyCloudinaryImage(member.photoCloudinaryId);
    photoUrl = result.secure_url;
    photoCloudinaryId = result.public_id;
  }

  await member.update({
    name: name ?? member.name,
    role: role ?? member.role,
    bio: bio ?? member.bio,
    order: order === undefined ? member.order : Number(order),
    photoUrl,
    photoCloudinaryId,
  });

  res.json(member);
});

const deleteTeamMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findByPk(req.params.id);
  if (!member) return res.status(404).json({ message: "Team member not found." });

  await destroyCloudinaryImage(member.photoCloudinaryId);
  await member.destroy();

  res.json({ message: "Team member deleted." });
});

module.exports = { listTeam, createTeamMember, updateTeamMember, deleteTeamMember };
