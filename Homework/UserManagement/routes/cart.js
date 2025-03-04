"use strict";

const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authMiddleware } = require("../middlewares/auth");

/**
 * Calculate the total cost of the cart.
 * @param {string} userId - The ID of the user.
 * @param {Object} options - Options for calculating the total.
 * @param {number} [options.discount=0] - Discount rate.
 * @param {number} [options.taxRate=0] - Tax rate.
 * @param {number} [options.shippingFee=0] - Shipping fee.
 * @returns {Promise<number>} - The total cost of the cart.
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
 * @route POST /cart
 * @description Add a product to the cart.
 * @access Private
 */
router.post("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const { productId, quantity } = req.body;

    // Validate required fields
    if (!productId || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    // Check for an existing cart for the user
    let cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      // If the cart doesn't exist, create a new one
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
    } else {
      // Check if the product is already in the cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        // If the product exists, update its quantity
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Otherwise, add the product to the cart
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route PATCH /cart/:productId
 * @description Update the quantity of a product in the cart.
 * @access Private
 */
router.patch("/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Validate that quantity is a non-negative number
    if (typeof quantity !== "number" || quantity < 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be a non-negative number" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route DELETE /cart/:productId
 * @description Remove a product from the cart.
 * @access Private
 */
router.delete("/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Validate required fields
    if (!userId || !productId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the cart for the given user
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the product exists in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Remove the product from the cart
    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route GET /cart
 * @description Get the cart for the authenticated user.
 * @access Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the cart for the given user
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart retrieved", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @route GET /cart/total
 * @description Get the total cost of the cart for the authenticated user.
 * @access Private
 */
router.get("/total", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const discount = req.query.discount ? parseFloat(req.query.discount) : 0;
    const taxRate = req.query.taxRate ? parseFloat(req.query.taxRate) : 0;
    const shippingFee = req.query.shippingFee
      ? parseFloat(req.query.shippingFee)
      : 0;

    if (isNaN(discount) || isNaN(taxRate) || isNaN(shippingFee)) {
      return res.status(400).json({ message: "Invalid query parameters" });
    }

    const total = await calculateCartTotal(userId, {
      discount,
      taxRate,
      shippingFee,
    });
    res.status(200).json({ total });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
