const express = require("express");
const cors = require("cors");
const restaurantRoutes = require("./routes/Restaurant");
const userRoutes = require("./routes/User");
const cartRoutes = require("./routes/Cart");
const orderRoutes = require("./routes/Order");
require("./database");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/restaurants", restaurantRoutes);
app.use("/users", userRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.listen(8080, () => {
  console.log(`Server started successfully on port 8080`);
});
