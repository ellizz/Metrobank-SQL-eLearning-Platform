require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const util = require("util"); // Import util for promisifying db queries

const db = require("./db"); // Import the database connection
const query = util.promisify(db.query).bind(db); // Convert db.query() to a Promise

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running...");
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Check if the user exists in the database
        const results = await query("SELECT * FROM users WHERE username = ?", [username]);

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const user = results[0];

        // Debugging logs (check what values are returned)
        console.log("Login Attempt:", username, password);
        console.log("Database Record:", user);

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        res.json({ message: "Login successful!" });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

app.get("/users", async (req, res) => {
    try {
        const results = await query("SELECT * FROM users");
        res.json(results);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Database error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
