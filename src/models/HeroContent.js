const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Singleton table: always exactly one row (id = 1), created by the seed script.
const HeroContent = sequelize.define(
  "HeroContent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    headline: DataTypes.STRING,
    subheadline: DataTypes.TEXT,
    ctaPrimaryText: DataTypes.STRING,
    ctaPrimaryLink: DataTypes.STRING,
    ctaSecondaryText: DataTypes.STRING,
    ctaSecondaryLink: DataTypes.STRING,
    statFilms: DataTypes.STRING,
    statYears: DataTypes.STRING,
    statAwards: DataTypes.STRING,
    // Array of { url, cloudinaryId, order } used for the hero collage
    heroImages: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
  },
  {
    tableName: "hero_content",
    timestamps: true,
  }
);

module.exports = HeroContent;
