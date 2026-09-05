const { Sequelize } = require("sequelize");

const useSSL = String(process.env.DB_SSL).toLowerCase() !== "false";

if (!process.env.DATABASE_URL) {
  // Fail loudly and early rather than letting Sequelize throw a cryptic error later.
  console.error(
    "DATABASE_URL is not set. Copy .env.example to .env and fill in your PostgreSQL connection string."
  );
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: useSSL
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false, // most managed Postgres providers use self-signed intermediate certs
        },
      }
    : {},
});

module.exports = sequelize;
