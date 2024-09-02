const express = require("express");
const router = express.Router();
const cartController = require("../controller/Cart");

router.post("/add", cartController.addItemToCart);
router.delete("/remove-item", cartController.removeItemFromCart);
router.get("/:id", cartController.getCartByUser);

module.exports = router;
