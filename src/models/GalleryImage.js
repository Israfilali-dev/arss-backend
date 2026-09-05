const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GalleryImage = sequelize.define(
  "GalleryImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cloudinaryId: DataTypes.STRING,
    caption: DataTypes.STRING,
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "gallery_images",
    timestamps: true,
  }
);

module.exports = GalleryImage;
