"use strict";

const express = require("express");
const asyncHandler = require("../../middlewares/async.handler");
const authController = require("../../controllers/auth.controller");
const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post(
  "/forgot-password",
  asyncHandler(authController.requestPasswordReset)
);
router.patch(
  "/reset-password/:token",
  asyncHandler(authController.resetPassword)
);
router.patch("/verify/:token", asyncHandler(authController.verifyEmail));
module.exports = router;
