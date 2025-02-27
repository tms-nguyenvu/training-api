"use strict";

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");

const todoRouter = require("./toto");
router.use(auth);
router.use("/v1/todos", todoRouter);

module.exports = router;
