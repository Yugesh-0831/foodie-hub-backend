const express = require("express");
const router = express.Router();
const orderController = require("../controller/Order");

// Route to place an order from the cart
router.post("/placeOrder", orderController.placeOrder);

module.exports = router;
