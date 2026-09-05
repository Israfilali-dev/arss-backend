const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SiteSettings = sequelize.define(
  "SiteSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    siteName: DataTypes.STRING,
    tagline: DataTypes.STRING,
    logoUrl: DataTypes.STRING,
    logoCloudinaryId: DataTypes.STRING,
    // { facebook, instagram, youtube, twitter, whatsapp }
    socialLinks: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: "site_settings",
    timestamps: true,
  }
);

module.exports = SiteSettings;
