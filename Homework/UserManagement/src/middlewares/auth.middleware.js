const jwt = require("jsonwebtoken");
const { HEADERS } = require("../constants/util.constant");
const {
  UnauthorizedError,
  BadRequestError,
} = require("../utils/error.response");

const generateAccessToken = async (payload) => {
  try {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "30m",
    });
    return accessToken;
  } catch (error) {
    throw error;
  }
};

const generateRefreshToken = async (payload) => {
  try {
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
    return refreshToken;
  } catch (error) {
    throw error;
  }
};

const generateTokens = async (payload) => {
  try {
    const accessToken = await generateAccessToken(payload);
    const refreshToken = await generateRefreshToken(payload);
    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

const generateVerificationToken = async (payload) => {
  try {
    const verificationToken = jwt.sign(
      payload,
      process.env.JWT_VERIFICATION_SECRET,
      { expiresIn: "1d" }
    );
    return verificationToken;
  } catch (error) {
    throw error;
  }
};

const generateResetToken = async (payload) => {
  try {
    const resetToken = jwt.sign(payload, process.env.JWT_RESET_SECRET, {
      expiresIn: "1h",
    });
    return resetToken;
  } catch (error) {
    throw error;
  }
};

const authentication = async (req, res, next) => {
  const accessToken = req.headers[HEADERS.AUTHORIZATION];

  if (!accessToken) {
    throw new UnauthorizedError("Token not exist.");
  }
  jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return next(new UnauthorizedError("Token is expired."));
      }
      return next(new UnauthorizedError("Token is invalid."));
    }

    req.user = user;
    next();
  });
};

const verifyAccessToken = async (accessToken) => {
  try {
    const decodedAccess = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET
    );
    return decodedAccess;
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Token is invalid.");
    }
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token is expired.");
    }
    throw error;
  }
};

const verifyRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new BadRequestError("Refresh token is required.");
  }

  try {
    const decodedRefresh = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    return decodedRefresh;
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new UnauthorizedError("Token is invalid.");
    }
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Token is expired.");
    }
    throw error;
  }
};
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  generateTokens,
  authentication,
  verifyRefreshToken,
  verifyAccessToken,
  generateVerificationToken,
};
