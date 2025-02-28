"use strict";

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

const todoRouter = require("./toto");
const authRouter = require("./auth");

// Apply api key for all routes
router.use(auth);
router.use("/v1/todos", todoRouter);
router.use("/v1/auths", authRouter);

module.exports = router;
