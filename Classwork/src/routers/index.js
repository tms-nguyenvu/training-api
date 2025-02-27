"use strict";

const express = require("express");
const router = express.Router();


const userRouter = require("./user");
const postRouter = require("./post");

router.use("/v1/users", userRouter);
router.use("/v1/posts", postRouter);

module.exports = router;