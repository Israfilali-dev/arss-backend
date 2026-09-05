const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Enquiry = sequelize.define(
  "Enquiry",
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
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    message: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM("new", "read", "archived"),
      defaultValue: "new",
    },
  },
  {
    tableName: "enquiries",
    timestamps: true,
  }
);

module.exports = Enquiry;
