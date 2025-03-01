const updateProfileValidate = (payload, options = { abortEarly: false }) => {
  const errors = [];
  const value = {};

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

  return {
    error: errors.length ? errors : null,
    value,
  };
};

module.exports = { updateProfileValidate };
