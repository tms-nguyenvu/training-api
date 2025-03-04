"use strict";
const router = require("express").Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

/**
 * Validate the product data.
 * @param {Object} data - The product data.
 * @param {string} data.name - The name of the product.
 * @param {string} data.sku - The SKU of the product.
 * @param {number} data.price - The price of the product.
 * @param {number} data.quantity - The quantity of the product.
 * @param {string} [data.thumbnail] - The thumbnail URL of the product.
 * @param {string} [data.image] - The image URL of the product.
 * @returns {Object} The validation result.
 * @returns {boolean} isValid - Whether the product data is valid.
 * @returns {string[]} errors - The validation errors.
 */
const validateProduct = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("Product name is required and must be a valid string.");
  }

  if (!data.sku || typeof data.sku !== "string" || !data.sku.trim()) {
    errors.push("SKU is required and must be a valid string.");
  }

  if (typeof data.price !== "number" || data.price < 0) {
    errors.push("Price must be a positive number.");
  }

  if (typeof data.quantity !== "number" || data.quantity < 0) {
    errors.push("Quantity must be a positive number.");
  }

  if (data.thumbnail && typeof data.thumbnail === "string") {
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
    if (!urlPattern.test(data.thumbnail)) {
      errors.push(
        "Thumbnail must be a valid image URL (.jpg, .png, .gif, .webp)."
      );
    }
  }

  if (data.image && typeof data.image === "string") {
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
    if (!urlPattern.test(data.image)) {
      errors.push("Image must be a valid image URL (.jpg, .png, .gif, .webp).");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get a paginated list of users (Admin only).
 * @route GET /users
 * @access Private (Admin)
 * @param {number} req.query.page - The page number.
 * @param {number} req.query.limit - The number of users per page.
 * @returns {Object} The paginated list of users.
 * @returns {number} page - The current page number.
 * @returns {number} limit - The number of users per page.
 * @returns {number} totalUsers - The total number of users.
 * @returns {number} totalPages - The total number of pages.
 * @returns {Object[]} users - The list of users.
 */
router.get(
  "/users",
  authMiddleware,
  adminMiddleware(["admin"]),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const users = await User.find()
        .select("-password -token")
        .skip(skip)
        .limit(limit);
      const totalUsers = await User.countDocuments();

      res.json({
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        users,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

/**
 * Create a new product (Admin only).
 * @route POST /products
 * @access Private (Admin)
 * @param {Object} req.body - The product data.
 * @param {string} req.body.name - The name of the product.
 * @param {string} req.body.sku - The SKU of the product.
 * @param {number} req.body.price - The price of the product.
 * @param {number} req.body.quantity - The quantity of the product.
 * @param {string} [req.body.thumbnail] - The thumbnail URL of the product.
 * @param {string} [req.body.image] - The image URL of the product.
 * @returns {Object} The created product.
 * @returns {string} message - The success message.
 * @returns {Object} product - The created product.
 */
router.post(
  "/products",
  authMiddleware,
  adminMiddleware(["admin"]),
  async (req, res) => {
    const { isValid, errors } = validateProduct(req.body);
    if (!isValid) {
      return res.status(400).json({ errors });
    }

    try {
      const newProduct = new Product(req.body);
      await newProduct.save();
      res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/**
 * @route PATCH /orders/:orderId/status
 * @description Update the status of an order.
 * @access Private (Admin only)
 *
 * Expected request body:
 * {
 *   "status": "processing" | "delivered" | "cancelled"
 * }
 */
router.patch(
  "/orders/:orderId/status",
  authMiddleware,
  adminMiddleware(["admin"]),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const validStatuses = ["processing", "delivered", "cancelled"];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          message:
            "Invalid status. Valid statuses are: processing, delivered, cancelled.",
        });
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      order.status = status;
      await order.save();

      res
        .status(200)
        .json({ message: "Order status updated successfully", order });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
