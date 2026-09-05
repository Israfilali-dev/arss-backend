const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TeamMember = sequelize.define(
  "TeamMember",
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
    role: DataTypes.STRING,
    bio: DataTypes.TEXT,
    photoUrl: DataTypes.STRING,
    photoCloudinaryId: DataTypes.STRING,
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "team_members",
    timestamps: true,
  }
);

module.exports = TeamMember;
