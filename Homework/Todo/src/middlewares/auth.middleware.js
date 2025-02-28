"use strict";

const { HEADERS } = require("../constants/util.constant");
const { UnauthorizedError } = require("../utils/error.response");

// Check if the API key is valid and matches the configured API key.
const auth = (req, res, next) => {
  const apiKey = req.headers[HEADERS.API_KEY]?.toString();

  if (!apiKey) {
    return next(new UnauthorizedError("API key is missing"));
  }

  if (apiKey !== process.env.API_KEY) {
    return next(new UnauthorizedError("Invalid API key provided"));
  }

  next();
};

module.exports = auth;
