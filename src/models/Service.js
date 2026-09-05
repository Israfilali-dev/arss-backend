const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Service = sequelize.define(
  "Service",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    icon: DataTypes.STRING, // a small icon keyword/slug the frontend maps to an SVG
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "services",
    timestamps: true,
  }
);

module.exports = Service;
