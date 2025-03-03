"use strict";

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();

dotenv.config();
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

// Init mongoose
const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Init routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
