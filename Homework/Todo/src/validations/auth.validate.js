"use strict";

const { isValidEmail } = require("./util.validate");

/**
 * Validate registration data
 * @param {object} payload - Input data
 * @param {object} [options] - Validation options, e.g., { abortEarly: true }
 * @returns {object} { error, value } with error being an array of errors (if any) and value being the validated data
 */
const registerValidate = (payload, options = { abortEarly: false }) => {
  const errors = [];
  const value = {};

  // Validate email
  if (
    !payload.email ||
    typeof payload.email !== "string" ||
    payload.email.trim() === ""
  ) {
    errors.push({ field: "email", message: "Email cannot be empty." });
    if (options.abortEarly) return { error: errors, value };
  } else {
    const email = payload.email.toLowerCase();
    if (!isValidEmail(email)) {
      errors.push({ field: "email", message: "Invalid email." });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.email = email;
    }
  }

  // Validate username
  if (
    !payload.username ||
    typeof payload.username !== "string" ||
    payload.username.trim() === ""
  ) {
    errors.push({
      field: "username",
      message: "Username cannot be empty.",
    });
    if (options.abortEarly) return { error: errors, value };
  } else {
    const username = payload.username;
    if (username.length < 3) {
      errors.push({
        field: "username",
        message: "Username must have at least 3 characters.",
      });
      if (options.abortEarly) return { error: errors, value };
    } else if (username.length > 30) {
      errors.push({
        field: "username",
        message: "Username must not exceed 30 characters.",
      });
      if (options.abortEarly) return { error: errors, value };
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      errors.push({
        field: "username",
        message: "Username can only contain letters and numbers.",
      });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.username = username;
    }
  }

  // Validate password
  if (
    !payload.password ||
    typeof payload.password !== "string" ||
    payload.password.trim() === ""
  ) {
    errors.push({
      field: "password",
      message: "Password cannot be empty.",
    });
    if (options.abortEarly) return { error: errors, value };
  } else {
    const password = payload.password;
    if (password.length < 8) {
      errors.push({
        field: "password",
        message: "Password must have at least 8 characters.",
      });
      if (options.abortEarly) return { error: errors, value };
    } else if (password.length > 32) {
      errors.push({
        field: "password",
        message: "Password must not exceed 32 characters.",
      });
      if (options.abortEarly) return { error: errors, value };
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.push({
        field: "password",
        message:
          "Password must include at least one lowercase letter, one uppercase letter, and one digit.",
      });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.password = password;
    }
  }

  // Validate role (optional)
  if (payload.role !== undefined) {
    if (
      typeof payload.role !== "string" ||
      !["user", "admin"].includes(payload.role)
    ) {
      errors.push({ field: "role", message: "Invalid role." });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.role = payload.role;
    }
  }

  // Validate isVerified (optional)
  if (payload.isVerified !== undefined) {
    if (typeof payload.isVerified !== "boolean") {
      errors.push({
        field: "isVerified",
        message: "isVerified must be a boolean.",
      });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.isVerified = payload.isVerified;
    }
  }

  return {
    error: errors.length ? errors : null,
    value,
  };
};

/**
 * Validate login data
 * @param {object} payload - Input data
 * @param {object} [options] - Validation options, e.g., { abortEarly: true }
 * @returns {object} { error, value } with error being an array of errors (if any) and value being the validated data
 */
const loginValidate = (payload, options = { abortEarly: false }) => {
  const errors = [];
  const value = {};

  // Validate email
  if (
    !payload.email ||
    typeof payload.email !== "string" ||
    payload.email.trim() === ""
  ) {
    errors.push({ field: "email", message: "Email cannot be empty." });
    if (options.abortEarly) return { error: errors, value };
  } else {
    const email = payload.email.toLowerCase();
    if (!isValidEmail(email)) {
      errors.push({ field: "email", message: "Invalid email." });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.email = email;
    }
  }

  // Validate password
  if (
    !payload.password ||
    typeof payload.password !== "string" ||
    payload.password.trim() === ""
  ) {
    errors.push({
      field: "password",
      message: "Password cannot be empty.",
    });
    if (options.abortEarly) return { error: errors, value };
  } else {
    const password = payload.password;
    if (password.length < 8) {
      errors.push({
        field: "password",
        message: "Password must have at least 8 characters.",
      });
      if (options.abortEarly) return { error: errors, value };
    } else if (password.length > 32) {
      errors.push({
        field: "password",
        message: "Password must not exceed 32 characters.",
      });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.password = password;
    }
  }

  return {
    error: errors.length ? errors : null,
    value,
  };
};

module.exports = {
  registerValidate,
  loginValidate,
};
