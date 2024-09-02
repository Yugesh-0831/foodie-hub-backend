const connection = require("../database");

// Add a new restaurant
exports.addRestaurant = (req, res) => {
  const {
    name,
    rating,
    location,
    avgPrice,
    homeImage,
    mainImage,
    foodType,
    foodItems,
  } = req.body;

  const restaurantQuery = `INSERT INTO restaurants (name, rating, location, avgPrice, homeImage, mainImage, foodType)
                           VALUES (?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
    restaurantQuery,
    [name, rating, location, avgPrice, homeImage, mainImage, foodType],
    (error, results) => {
      if (error) {
        console.error("Error adding restaurant:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      const restaurantId = results.insertId;

      // Insert food items if provided
      if (foodItems && Array.isArray(foodItems) && foodItems.length > 0) {
        const foodItemsQuery = `INSERT INTO food_items (name, price, description, image, restaurant_id)
                                VALUES ?`;

        const foodItemsValues = foodItems.map((item) => [
          item.name,
          item.price,
          item.description,
          item.image,
          restaurantId,
        ]);

        // Ensure foodItemsValues is not empty
        if (foodItemsValues.length > 0) {
          connection.query(foodItemsQuery, [foodItemsValues], (err) => {
            if (err) {
              console.error("Error adding food items:", err);
              return res.status(500).json({ message: "Internal server error" });
            }

            res.status(201).json({
              message: "Restaurant and food items added successfully",
              id: restaurantId,
            });
          });
        } else {
          res.status(201).json({
            message: "Restaurant added successfully",
            id: restaurantId,
          });
        }
      } else {
        res.status(201).json({
          message: "Restaurant added successfully",
          id: restaurantId,
        });
      }
    }
  );
};

// Get a specific restaurant by ID
exports.getRestaurant = (req, res) => {
  const restaurantId = req.params.id;

  const query = `
    SELECT r.id AS restaurantId, r.name AS restaurantName, r.rating, r.location, r.avgPrice, r.homeImage, r.mainImage, r.foodType,
           f.id AS foodItemId, f.name AS foodItemName, f.price, f.description, f.image AS foodItemImage
    FROM restaurants r
    LEFT JOIN food_items f ON r.id = f.restaurant_id
    WHERE r.id = ?
  `;

  connection.query(query, [restaurantId], (error, results) => {
    if (error) {
      console.error("Error retrieving restaurant and food items:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurant = {
      id: results[0].restaurantId,
      name: results[0].restaurantName,
      rating: results[0].rating,
      location: results[0].location,
      avgPrice: results[0].avgPrice,
      homeImage: results[0].homeImage,
      mainImage: results[0].mainImage,
      foodType: results[0].foodType,
      foodItems: [],
    };

    results.forEach((row) => {
      if (row.foodItemId) {
        restaurant.foodItems.push({
          id: row.foodItemId,
          name: row.foodItemName,
          price: row.price,
          description: row.description,
          image: row.foodItemImage,
        });
      }
    });

    res.status(200).json(restaurant);
  });
};

// Get all restaurants
exports.getAllRestaurants = (req, res) => {
  const query = "SELECT * FROM restaurants";

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error retrieving restaurants:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(200).json(results);
  });
};

// Update a restaurant
exports.updateRestaurant = (req, res) => {
  const restaurantId = req.params.id;
  const {
    name,
    rating,
    location,
    avgPrice,
    homeImage,
    mainImage,
    foodType,
    foodItems,
  } = req.body;

  const updateRestaurantQuery = `UPDATE restaurants SET name = ?, rating = ?, location = ?, avgPrice = ?, homeImage = ?, mainImage = ?, foodType = ? WHERE id = ?`;

  connection.query(
    updateRestaurantQuery,
    [
      name,
      rating,
      location,
      avgPrice,
      homeImage,
      mainImage,
      foodType,
      restaurantId,
    ],
    (error) => {
      if (error) {
        console.error("Error updating restaurant:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      // Handle food items
      if (foodItems && Array.isArray(foodItems)) {
        // Delete existing food items for this restaurant
        const deleteFoodItemsQuery = `DELETE FROM food_items WHERE restaurant_id = ?`;
        connection.query(deleteFoodItemsQuery, [restaurantId], (err) => {
          if (err) {
            console.error("Error deleting old food items:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          // Insert new food items
          const foodItemsQuery = `INSERT INTO food_items (name, price, description, image, restaurant_id)
                                  VALUES ?`;

          const foodItemsValues = foodItems.map((item) => [
            item.name,
            item.price,
            item.description,
            item.image,
            restaurantId,
          ]);

          // Ensure foodItemsValues is not empty
          if (foodItemsValues.length > 0) {
            connection.query(foodItemsQuery, [foodItemsValues], (err) => {
              if (err) {
                console.error("Error adding food items:", err);
                return res
                  .status(500)
                  .json({ message: "Internal server error" });
              }

              res
                .status(200)
                .json({ message: "Restaurant updated successfully" });
            });
          } else {
            res
              .status(200)
              .json({ message: "Restaurant updated successfully" });
          }
        });
      } else {
        res.status(200).json({ message: "Restaurant updated successfully" });
      }
    }
  );
};
