const { FooterContent } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const getFooter = asyncHandler(async (req, res) => {
  const [footer] = await FooterContent.findOrCreate({ where: { id: 1 } });
  res.json(footer);
});

const updateFooter = asyncHandler(async (req, res) => {
  const [footer] = await FooterContent.findOrCreate({ where: { id: 1 } });
  const { phone, email, address, copyrightText } = req.body;
  await footer.update({ phone, email, address, copyrightText });
  res.json(footer);
});

module.exports = { getFooter, updateFooter };
