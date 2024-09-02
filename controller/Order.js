const connection = require("../database");

// Helper function to handle errors
const handleError = (res, message, err) => {
  console.error(message, err);
  res.status(500).json({ message: "Internal server error" });
};

// Place an order from the current cart
exports.placeOrder = (req, res) => {
  const { user_id } = req.body;

  // Start a transaction
  connection.beginTransaction((err) => {
    if (err) return handleError(res, "Error starting transaction:", err);

    // Step 1: Fetch the cart_id for the provided user_id
    const fetchCartQuery = `SELECT cart_id FROM cart WHERE user_id = ?`;

    connection.query(fetchCartQuery, [user_id], (err, results) => {
      if (err) {
        return connection.rollback(() => {
          handleError(res, "Error fetching cart:", err);
        });
      }

      if (results.length === 0) {
        return connection.rollback(() => {
          res.status(404).json({ message: "Cart not found for user" });
        });
      }

      const cart_id = results[0].cart_id;

      // Step 2: Create the order
      const createOrderQuery = `
        INSERT INTO orders (user_id, total_cost, order_date)
        SELECT user_id, total_cost, NOW()
        FROM cart
        WHERE cart_id = ?`;

      connection.query(createOrderQuery, [cart_id], (err, result) => {
        if (err) {
          return connection.rollback(() => {
            handleError(res, "Error creating order:", err);
          });
        }

        const order_id = result.insertId;

        // Step 3: Copy cart items to order items
        const copyItemsQuery = `
          INSERT INTO order_items (order_id, food_item_id, quantity, price)
          SELECT ?, food_item_id, quantity, price
          FROM cart_items
          WHERE cart_id = ?`;

        connection.query(copyItemsQuery, [order_id, cart_id], (err) => {
          if (err) {
            return connection.rollback(() => {
              handleError(res, "Error copying cart items:", err);
            });
          }

          // Commented out Step 3: Clear cart items
          const clearCartItemsQuery = `DELETE FROM cart_items WHERE cart_id = ?`;

          connection.query(clearCartItemsQuery, [cart_id], (err) => {
            if (err) {
              return connection.rollback(() => {
                handleError(res, "Error clearing cart items:", err);
              });
            }
          });

          // Commented out Step 4: Clear the cart
          const clearCartQuery = `DELETE FROM cart WHERE cart_id = ?`;

          connection.query(clearCartQuery, [cart_id], (err) => {
            if (err) {
              return connection.rollback(() => {
                handleError(res, "Error clearing cart:", err);
              });
            }
          });

          // Commit the transaction
          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                handleError(res, "Error committing transaction:", err);
              });
            }

            res.status(200).json({ message: "Order placed successfully" });
          });
        });
      });
    });
  });
};
