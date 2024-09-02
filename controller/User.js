const connection = require("../database");

// Create/Signup a new user
exports.signup = (req, res) => {
  const { name, password, number, email } = req.body;

  const query = `INSERT INTO users (name, password, number, email) VALUES (?, ?, ?, ?)`;
  connection.query(query, [name, password, number, email], (error) => {
    if (error) {
      console.error("Error signing up user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.status(201).json({ message: "User created successfully" });
  });
};

// Login user
exports.login = (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT id, name, password FROM users WHERE email = ?`;
  connection.query(query, [email], (error, results) => {
    if (error) {
      console.error("Error logging in user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    // Check if the password matches
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ user });
  });
};

// Update user information
exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { name, password, number, email } = req.body;

  const updateQuery = `UPDATE users SET name = ?, password = ?, number = ?, email = ? WHERE id = ?`;
  const queryParams = [name, password, number, email, userId];

  connection.query(updateQuery, queryParams, (error) => {
    if (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(200).json({ message: "User updated successfully" });
  });
};

// Get user by ID
exports.getUserById = (req, res) => {
  const userId = req.params.id;

  const query = `SELECT id, name, number, email FROM users WHERE id = ?`;
  connection.query(query, [userId], (error, results) => {
    if (error) {
      console.error("Error retrieving user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    res.status(200).json({ user });
  });
};
