const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const COOKIE_NAME = process.env.COOKIE_NAME || "arss_admin_token";

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json({ message: "Incorrect username or password." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Incorrect username or password." });
  }

  const token = signToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({
    message: "Logged in.",
    user: { id: user.id, username: user.username, role: user.role },
    token, // also returned in the body for non-cookie (e.g. mobile) clients
  });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Logged out." });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { login, logout, me };
