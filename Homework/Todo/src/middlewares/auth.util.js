"use strict";

const { HEADERS } = require("../constants/util.constant");
const { UnauthorizedError } = require("../utils/error.response");

/**
 * Generate a JWT-like token.
 * @param {object} payload - The payload data to include in the token.
 * @returns {Promise<object>} - Returns a promise that resolves with an object containing the accessToken.
 */
const generateTokens = async (payload) => {
  // Retrieve the secret key from environment variables.
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("Secret key is not defined in environment variables.");
  }

  // Create a header for the token. Here we set alg to "none" to indicate no real signature.
  const header = { alg: "none", typ: "JWT" };

  // Convert header and payload to JSON strings.
  const headerStr = JSON.stringify(header);
  const payloadStr = JSON.stringify(payload);

  // Encode the JSON strings to Base64.
  const headerBase64 = Buffer.from(headerStr).toString("base64");
  const payloadBase64 = Buffer.from(payloadStr).toString("base64");

  // Construct the token as "header.payload.secretKey".
  const token = `${headerBase64}.${payloadBase64}.${secretKey}`;

  // Return the token (wrapped in an object as accessToken).
  return { accessToken: token };
};

/**
 * Verify (decode) the token.
 *
 * @param {string} token - The token to decode.
 * @returns {object} - The decoded payload.
 * @throws {UnauthorizedError} - If the token format is invalid.
 */
const verifyToken = (token) => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new UnauthorizedError("Invalid token format.");
  }

  const [headerBase64, payloadBase64, signature] = parts;
  if (!headerBase64 || !payloadBase64 || !signature) {
    throw new UnauthorizedError("Invalid token format.");
  }
  // Decode payload from Base64.
  const payloadJSON = Buffer.from(payloadBase64, "base64").toString("utf8");
  const payload = JSON.parse(payloadJSON);

  // Optionally, you could check if the signature matches (if you had a real signing process).

  return payload;
};

const authMiddleware = async (req, res, next) => {
  const accessToken = req.headers[HEADERS.AUTHORIZATION];

  if (!accessToken) {
    throw new UnauthorizedError("Missing or invalid Authorization header.");
  }

  const decodedPayload = await verifyToken(accessToken);
  if (!decodedPayload) {
    throw new UnauthorizedError("Invalid token.");
  }
  req.user = decodedPayload;
  next();
};

module.exports = {
  generateTokens,
  verifyToken,
  authMiddleware,
};
