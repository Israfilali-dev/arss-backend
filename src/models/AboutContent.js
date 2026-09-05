const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AboutContent = sequelize.define(
  "AboutContent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    heading: DataTypes.STRING,
    paragraph1: DataTypes.TEXT,
    paragraph2: DataTypes.TEXT,
  },
  {
    tableName: "about_content",
    timestamps: true,
  }
);

module.exports = AboutContent;
