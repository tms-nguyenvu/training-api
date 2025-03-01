"use strict";

const { ForbiddenRequestError } = require("../utils/error.response");
const asyncHandler = require("./async.handler");

const roleMiddleware = (allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      throw new ForbiddenRequestError(
        "You are not authorized to access this resource."
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenRequestError(
        "You are not authorized to access this resource."
      );
    }
    next();
  });
};

module.exports = roleMiddleware;
