"use strict";

const express = require("express");
const router = express.Router();
const asyncHandler = require("../../middlewares/async.handler");
const profileController = require("../../controllers/profile.controller");
const roleMiddleware = require("../../middlewares/role.middleware");
const { authentication } = require("../../middlewares/auth.middleware");

router.use(asyncHandler(authentication));
router.get(
  "/",
  roleMiddleware(["admin", "user"]),
  asyncHandler(profileController.getProfile)
);
router.put(
  "/",
  roleMiddleware(["admin", "user"]),
  asyncHandler(profileController.updateProfile)
);

module.exports = router;
