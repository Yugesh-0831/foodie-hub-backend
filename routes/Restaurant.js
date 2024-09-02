const express = require("express");
const router = express.Router();
const restaurantController = require("../controller/Restaurant");

router.post("/", restaurantController.addRestaurant);

router.get("/:id", restaurantController.getRestaurant);

router.get("/", restaurantController.getAllRestaurants);

router.put("/:id", restaurantController.updateRestaurant);

module.exports = router;
