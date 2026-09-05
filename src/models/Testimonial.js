const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Testimonial = sequelize.define(
  "Testimonial",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleOrProject: DataTypes.STRING,
    quote: DataTypes.TEXT,
    photoUrl: DataTypes.STRING,
    photoCloudinaryId: DataTypes.STRING,
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "testimonials",
    timestamps: true,
  }
);

module.exports = Testimonial;
