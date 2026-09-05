const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const FooterContent = sequelize.define(
  "FooterContent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.TEXT,
    copyrightText: DataTypes.STRING,
  },
  {
    tableName: "footer_content",
    timestamps: true,
  }
);

module.exports = FooterContent;
