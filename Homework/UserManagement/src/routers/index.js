"use strict";

const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const profileRouter = require("./profile");

router.use("/v1/auth", authRouter);
router.use("/v1/profile", profileRouter);

module.exports = router;
