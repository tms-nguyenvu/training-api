"use strict";

/**
 * Validate Todo data.
 *
 * @param {object} payload - The input data.
 * @param {object} [options] - Validation options, e.g., { abortEarly: true }
 * @returns {object} - Returns an object with properties:
 *   - error: an array of error objects (or null if no errors),
 *   - value: an object containing validated fields.
 */
const todoValidate = (payload, options = { abortEarly: false }) => {
  const errors = [];
  const value = {};

  // Validate title: required, must be a string, min length 3, max length 255.
  if (
    payload.title === undefined ||
    payload.title === null ||
    typeof payload.title !== "string" ||
    payload.title.trim() === ""
  ) {
    errors.push({ field: "title", message: "Title cannot be empty" });
    if (options.abortEarly) return { error: errors, value };
  } else {
    const title = payload.title.trim();
    if (title.length < 3) {
      errors.push({
        field: "title",
        message: "Title must be at least 3 characters long",
      });
      if (options.abortEarly) return { error: errors, value };
    } else if (title.length > 255) {
      errors.push({
        field: "title",
        message: "Title must not exceed 255 characters",
      });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.title = title;
    }
  }

  // Validate description: optional, if provided must be a string.
  if (payload.description !== undefined) {
    if (typeof payload.description !== "string") {
      errors.push({
        field: "description",
        message: "Description must be a string",
      });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.description = payload.description;
    }
  }

  // Validate status: optional, if provided must be one of "pending", "in_progress", "completed".
  if (payload.status !== undefined) {
    if (
      typeof payload.status !== "string" ||
      !["pending", "in_progress", "completed"].includes(payload.status)
    ) {
      errors.push({
        field: "status",
        message: "Status must be either pending, in_progress or completed",
      });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.status = payload.status;
    }
  }

  // Validate dueDate: optional, if provided must be a valid date.
  if (payload.dueDate !== undefined) {
    const dueDate = new Date(payload.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push({
        field: "dueDate",
        message: "Due date must be a valid date",
      });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.dueDate = dueDate;
    }
  }

  // Validate createdBy: optional, if provided must be a non-empty string.
  if (payload.createdBy !== undefined) {
    if (
      typeof payload.createdBy !== "string" ||
      payload.createdBy.trim() === ""
    ) {
      errors.push({
        field: "createdBy",
        message: "Created by cannot be empty",
      });
      if (options.abortEarly) return { error: errors, value };
    } else {
      value.createdBy = payload.createdBy.trim();
    }
  }

  return { error: errors.length ? errors : null, value };
};

module.exports = { todoValidate };
