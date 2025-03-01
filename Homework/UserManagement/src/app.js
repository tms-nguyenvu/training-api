const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const dotenv = require("dotenv");
const app = express();

// INITIALIZE MIDDLEWARES
dotenv.config();
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// INITIALIZE DATABASE
require("./libs/init.mongodb");

// const { checkOverload } = require("./helpers/check-connect");
// checkOverload();

// INITIALIZE ROUTES
app.use("/", require("./routers"));

const { NotFoundError } = require("./utils/error.response");
app.use((req, res, next) => {
  next(new NotFoundError("Not found"));
});

// ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  const statusCode = err.code || 500;
  return res.status(statusCode).json({
    status: err.status || "failed",
    code: statusCode,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
