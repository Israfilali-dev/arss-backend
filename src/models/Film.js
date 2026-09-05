const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Film = sequelize.define(
  "Film",
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
    category: DataTypes.STRING,
    year: DataTypes.STRING,
    description: DataTypes.TEXT,
    posterUrl: DataTypes.STRING,
    posterCloudinaryId: DataTypes.STRING,
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      defaultValue: "published",
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "films",
    timestamps: true,
  }
);

module.exports = Film;
