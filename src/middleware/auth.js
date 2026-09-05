const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Protects admin routes. Reads the JWT from the httpOnly cookie set at login
// (falls back to an Authorization: Bearer header, useful for non-browser clients).
async function requireAuth(req, res, next) {
  try {
    const cookieToken = req.cookies?.[process.env.COOKIE_NAME || "arss_admin_token"];
    const headerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "username", "role"],
    });

    if (!user) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired or invalid. Please log in again." });
  }
}

module.exports = { requireAuth };
