const express = require("express");
const router = express.Router();
const userController = require("../controller/User");

// Signup route
router.post("/signup", userController.signup);

// Login route
router.post("/login", userController.login);

// Update user route
router.put("/update/:id", userController.updateUser);

router.get("/:id", userController.getUserById);

module.exports = router;
