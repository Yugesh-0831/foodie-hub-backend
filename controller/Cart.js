const connection = require("../database");

// Helper function to handle errors
const handleError = (res, message, err) => {
  console.error(message, err);
  res.status(500).json({ message: "Internal server error" });
};

// Helper function to update cart total
const updateCartTotal = (cart_id, res) => {
  const updateTotalQuery = `
    UPDATE cart c
    JOIN (
      SELECT cart_id, SUM(ci.quantity * fi.price) AS total_amount
      FROM cart_items ci
      JOIN food_items fi ON ci.food_item_id = fi.id
      WHERE ci.cart_id = ?
      GROUP BY ci.cart_id
    ) AS total_query
    ON c.cart_id = total_query.cart_id
    SET c.total_cost = total_query.total_amount
    WHERE c.cart_id = ?`;

  connection.query(updateTotalQuery, [cart_id, cart_id], (err) => {
    if (err) {
      return handleError(res, "Error updating cart total:", err);
    }
    res.status(200).json({ message: "Cart total updated successfully" });
  });
};

// Add an item to a user's cart
exports.addItemToCart = (req, res) => {
  const { user_id, food_item_id, quantity } = req.body;

  const cartQuery = `SELECT cart_id FROM cart WHERE user_id = ?`;
  connection.query(cartQuery, [user_id], (err, results) => {
    if (err) return handleError(res, "Error finding cart:", err);

    let cart_id;

    if (results.length === 0) {
      const createCartQuery = `INSERT INTO cart (user_id) VALUES (?)`;
      connection.query(createCartQuery, [user_id], (err, result) => {
        if (err) return handleError(res, "Error creating cart:", err);
        cart_id = result.insertId;
        addOrUpdateItem(cart_id);
      });
    } else {
      cart_id = results[0].cart_id;
      addOrUpdateItem(cart_id);
    }

    function addOrUpdateItem(cart_id) {
      const getFoodItemPriceQuery = `SELECT price FROM food_items WHERE id = ?`;
      connection.query(
        getFoodItemPriceQuery,
        [food_item_id],
        (err, priceResults) => {
          if (err)
            return handleError(res, "Error getting food item price:", err);

          const itemPrice = priceResults[0].price;

          const checkItemQuery = `SELECT quantity FROM cart_items WHERE cart_id = ? AND food_item_id = ?`;
          connection.query(
            checkItemQuery,
            [cart_id, food_item_id],
            (err, itemResults) => {
              if (err)
                return handleError(res, "Error checking item in cart:", err);

              if (itemResults.length > 0) {
                const existingQuantity = itemResults[0].quantity;
                const newQuantity = existingQuantity + quantity;

                const updateItemQuery = `UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND food_item_id = ?`;
                connection.query(
                  updateItemQuery,
                  [newQuantity, cart_id, food_item_id],
                  (err) => {
                    if (err)
                      return handleError(
                        res,
                        "Error updating item quantity:",
                        err
                      );
                    updateCartTotal(cart_id, res);
                  }
                );
              } else {
                const addItemQuery = `INSERT INTO cart_items (cart_id, food_item_id, quantity, price) VALUES (?, ?, ?, ?)`;
                connection.query(
                  addItemQuery,
                  [cart_id, food_item_id, quantity, itemPrice],
                  (err) => {
                    if (err)
                      return handleError(
                        res,
                        "Error adding item to cart:",
                        err
                      );
                    updateCartTotal(cart_id, res);
                  }
                );
              }
            }
          );
        }
      );
    }
  });
};

// Get user's cart with total cost
exports.getCartByUser = (req, res) => {
  const { id } = req.params;

  const getCartQuery = `
    SELECT
      c.cart_id,
      c.total_cost AS total_cost,
      ci.cart_item_id,
      ci.food_item_id,
      fi.name,
      ci.quantity,
      ci.price AS item_price,
      (ci.quantity * ci.price) AS item_total
    FROM cart c
    JOIN cart_items ci ON c.cart_id = ci.cart_id
    JOIN food_items fi ON ci.food_item_id = fi.id
    WHERE c.user_id = ?
  `;

  connection.query(getCartQuery, [id], (err, results) => {
    if (err) return handleError(res, "Error retrieving cart:", err);

    const cartDetails =
      results.length > 0
        ? {
            cartId: results[0].cart_id,
            totalCost: results[0].total_cost,
            items: results.map((item) => ({
              cartItemId: item.cart_item_id,
              foodItemId: item.food_item_id,
              name: item.name,
              quantity: item.quantity,
              itemPrice: item.item_price,
              itemTotal: item.item_total,
            })),
          }
        : {
            cartId: null,
            totalCost: 0,
            items: [],
          };

    res.status(200).json(cartDetails);
  });
};

// Remove or reduce an item from the user's cart
exports.removeItemFromCart = (req, res) => {
  const { user_id, food_item_id } = req.body;

  const getCartIdQuery = `SELECT cart_id FROM cart WHERE user_id = ?`;
  connection.query(getCartIdQuery, [user_id], (err, results) => {
    if (err) return handleError(res, "Error finding cart:", err);

    if (results.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const cart_id = results[0].cart_id;

    const getItemQuantityQuery = `SELECT quantity, price FROM cart_items WHERE cart_id = ? AND food_item_id = ?`;
    connection.query(
      getItemQuantityQuery,
      [cart_id, food_item_id],
      (err, results) => {
        if (err) return handleError(res, "Error getting item quantity:", err);

        if (results.length === 0) {
          return res.status(404).json({ message: "Item not found in cart" });
        }

        const currentQuantity = results[0].quantity;
        const itemPrice = results[0].price;

        if (currentQuantity > 1) {
          const reduceQuantityQuery = `UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND food_item_id = ?`;
          connection.query(
            reduceQuantityQuery,
            [currentQuantity - 1, cart_id, food_item_id],
            (err) => {
              if (err)
                return handleError(res, "Error reducing item quantity:", err);
              updateCartTotal(cart_id, res);
            }
          );
        } else {
          const deleteItemQuery = `DELETE FROM cart_items WHERE cart_id = ? AND food_item_id = ?`;
          connection.query(deleteItemQuery, [cart_id, food_item_id], (err) => {
            if (err)
              return handleError(res, "Error deleting item from cart:", err);

            const checkEmptyCartQuery = `SELECT COUNT(*) AS item_count FROM cart_items WHERE cart_id = ?`;
            connection.query(checkEmptyCartQuery, [cart_id], (err, results) => {
              if (err)
                return handleError(res, "Error checking cart items:", err);

              if (results[0].item_count === 0) {
                const deleteCartQuery = `DELETE FROM cart WHERE cart_id = ?`;
                connection.query(deleteCartQuery, [cart_id], (err) => {
                  if (err) return handleError(res, "Error deleting cart:", err);
                  res.status(200).json({
                    message: "Item removed and cart deleted successfully",
                  });
                });
              } else {
                updateCartTotal(cart_id, res);
              }
            });
          });
        }
      }
    );
  });
};
