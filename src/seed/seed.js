require("dotenv").config();
const bcrypt = require("bcryptjs");
const {
  sequelize,
  User,
  HeroContent,
  AboutContent,
  FooterContent,
  SiteSettings,
  Film,
  TeamMember,
} = require("../models");

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  // --- Admin user ---
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password || password === "change_this_before_seeding") {
    console.error(
      "Set SEED_ADMIN_PASSWORD in your .env to a real password before seeding."
    );
    process.exit(1);
  }

  const existingAdmin = await User.findOne({ where: { username } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ username, passwordHash, role: "admin" });
    console.log(`Created admin user "${username}".`);
  } else {
    console.log(`Admin user "${username}" already exists — skipping.`);
  }

  // --- Hero (matches current index.html copy) ---
  await HeroContent.findOrCreate({
    where: { id: 1 },
    defaults: {
      headline: "Where emotion turns into film.",
      subheadline:
        "ARSS Entertainment is a production house built on one belief — a story is only as strong as the feeling it leaves behind. We produce films that stay with an audience long after the credits roll.",
      ctaPrimaryText: "View Our Films",
      ctaPrimaryLink: "#films",
      ctaSecondaryText: "Connect With Us",
      ctaSecondaryLink: "#connect",
      statFilms: "12+",
      statYears: "8",
      statAwards: "15",
      heroImages: [],
    },
  });

  // --- About ---
  await AboutContent.findOrCreate({
    where: { id: 1 },
    defaults: {
      heading: "The studio behind the story",
      paragraph1:
        "Founded on the idea that cinema should be felt before it is understood, ARSS Entertainment develops, finances and produces films across genres — from intimate dramas to large-canvas features. Every project starts with a single question: what will the audience carry home with them?",
      paragraph2:
        "We work closely with writers, directors and technicians who share that obsession with feeling, building productions that are disciplined on set and fearless in the edit. Our slate spans theatrical releases, streaming originals and short-format work.",
    },
  });

  // --- Footer ---
  await FooterContent.findOrCreate({
    where: { id: 1 },
    defaults: {
      phone: "+91 81003 92464",
      email: "contact@arssentertainment.com",
      address: "Tollygunge, Kolkata, West Bengal, India",
      copyrightText: "© 2026 ARSS Entertainment. All rights reserved.",
    },
  });

  // --- Site settings ---
  await SiteSettings.findOrCreate({
    where: { id: 1 },
    defaults: {
      siteName: "ARSS Entertainment",
      tagline: "Where Emotion Turns Into Film",
      logoUrl: null, // upload via Admin → Logo & Hero after seeding
      logoCloudinaryId: null,
      socialLinks: {
        whatsapp: "https://wa.me/918100392464",
      },
    },
  });

  // --- Sample films & team (only if none exist yet, so re-running is safe) ---
  const filmCount = await Film.count();
  if (filmCount === 0) {
    await Film.bulkCreate([
      {
        title: "The Silent Ember",
        category: "Drama",
        year: "2024",
        description:
          "A daughter returns to her hometown to confront the fire that changed her family forever.",
        status: "published",
        order: 0,
      },
      {
        title: "Monsoon Diaries",
        category: "Romance",
        year: "2023",
        description:
          "Two strangers, one rain-soaked city, and a friendship that becomes something more.",
        status: "published",
        order: 1,
      },
    ]);
    console.log("Seeded sample films.");
  }

  const teamCount = await TeamMember.count();
  if (teamCount === 0) {
    await TeamMember.bulkCreate([
      {
        name: "Arindam Roy",
        role: "Founder & Producer",
        bio: "Leads ARSS Entertainment's slate with a focus on emotionally driven storytelling.",
        order: 0,
      },
    ]);
    console.log("Seeded sample team member.");
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
