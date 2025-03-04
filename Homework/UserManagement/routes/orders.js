"use strict";

const { authMiddleware } = require("../middlewares/auth");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = require("express").Router();

/**
 * Calculate the total cost of the cart.
 * @param {string} userId - The ID of the user.
 * @param {Object} options - The options for calculating the total.
 * @param {number} [options.discount=0] - The discount rate.
 * @param {number} [options.taxRate=0] - The tax rate.
 * @param {number} [options.shippingFee=0] - The shipping fee.
 * @returns {Promise<number>} The total cost of the cart.
 */
async function calculateCartTotal(
  userId,
  { discount = 0, taxRate = 0, shippingFee = 0 } = {}
) {
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart) {
    return 0;
  }

  let subtotal = 0;
  for (const item of cart.items) {
    const product = item.productId;
    if (product && product.price) {
      subtotal += product.price * item.quantity;
    }
  }

  const discountAmount = subtotal * discount;
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * taxRate;
  const total = afterDiscount + tax + shippingFee;

  return total;
}

/**
 * @route POST /orders
 * @description Create a new order for the authenticated user from their cart.
 *              It deducts the product inventory, calculates the total cost,
 *              and then clears the cart.
 * @access Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Parse calculation parameters from the request body
    const discount = req.body.discount ? parseFloat(req.body.discount) : 0;
    const taxRate = req.body.taxRate ? parseFloat(req.body.taxRate) : 0;
    const shippingFee = req.body.shippingFee
      ? parseFloat(req.body.shippingFee)
      : 0;

    // Check product inventory for each item in the cart
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId._id}` });
      }
      if (product.quantity < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for product ${product.name}` });
      }
    }

    // Calculate the total cost of the order
    const total = await calculateCartTotal(userId, {
      discount,
      taxRate,
      shippingFee,
    });

    // Map the cart items to order items (store only product ID and quantity)
    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
    }));

    // Create the order with default status "processing"
    const order = new Order({
      userId,
      items: orderItems,
      discount,
      taxRate,
      shippingFee,
      total,
      status: "processing",
    });
    await order.save();

    // Deduct product quantity in inventory
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      product.quantity -= item.quantity;
      await product.save();
    }

    // Clear the cart after processing the order
    cart.items = [];
    await cart.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route PATCH /orders/:orderId/confirm
 * @description Confirm an order for the authenticated user.
 * @access Private
 */
router.patch("/:orderId/confirm", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "processing") {
      return res.status(400).json({ message: "Order cannot be confirmed" });
    }

    order.status = "delivered";
    await order.save();

    res.status(200).json({ message: "Order confirmed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route PATCH /orders/:orderId/cancel
 * @description Cancel an order for the authenticated user.
 * @access Private
 */
router.patch("/:orderId/cancel", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (order.status !== "processing") {
      return res.status(400).json({
        message:
          "Order cannot be cancelled because it has already been shipped or delivered.",
      });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route GET /orders
 * @description Get the list of orders for the authenticated user.
 * @access Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route GET /orders/:orderId
 * @description Get a specific order for the authenticated user.
 * @access Private
 */
router.get("/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, userId }).populate(
      "items.productId"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
