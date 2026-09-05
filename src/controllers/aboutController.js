const { AboutContent } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const getAbout = asyncHandler(async (req, res) => {
  const [about] = await AboutContent.findOrCreate({ where: { id: 1 } });
  res.json(about);
});

const updateAbout = asyncHandler(async (req, res) => {
  const [about] = await AboutContent.findOrCreate({ where: { id: 1 } });
  const { heading, paragraph1, paragraph2 } = req.body;
  await about.update({ heading, paragraph1, paragraph2 });
  res.json(about);
});

module.exports = { getAbout, updateAbout };
