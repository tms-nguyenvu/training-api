const User = require("../models/User");

/**
 * Middleware to authenticate users based on a token.
 * @middleware
 * @param {Object} req - Express request object.
 * @param {Object} req.headers - The request headers.
 * @param {string} [req.headers.Authorization] - The Authorization header containing the token.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {Object} - Returns a 401 error if no token is provided, or a 403 error if the token is invalid.
 */
const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Find user with the given token in the database
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(403).json({ message: "Invalid token." });
    }

    req.user = user; // Attach user information to the request
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Middleware to authorize users based on their role.
 * @middleware
 * @param {string[]} roles - An array of allowed roles (e.g., ["admin", "user"]).
 * @returns {Function} - Express middleware function.
 */
const adminMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied." });
    }
    next();
  };
};

module.exports = { authMiddleware, adminMiddleware };
