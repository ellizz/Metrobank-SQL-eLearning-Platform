require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const util = require("util");
const cors = require("cors"); 

const db = require("./db");
const query = util.promisify(db.query).bind(db);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:8080',  // Make sure this is your frontend's URL
    methods: ['GET', 'POST'],        // Allowed methods (GET, POST)
    allowedHeaders: ['Content-Type'], // Allowed headers
};

app.use(cors(corsOptions));  // Use the CORS options for requests

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is running...");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const results = await query("SELECT * FROM users WHERE email = ?", [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // ✅ Send role information to the frontend
        res.json({
            message: "Login successful!",
            role: user.role  // This allows the frontend to redirect correctly
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


app.get("/users", async (req, res) => {
    console.log("Fetching users...");  // Log request to check if it's being hit
    try {
        const results = await query("SELECT name, email, created_at, role, user_id FROM users");
        res.json(results);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Database error" });
    }
});

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const existingUser = await query("SELECT * FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email already registered." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Generate a unique 7-character user ID
        const generateUserId = () => {
            const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            let userId = "";
            for (let i = 0; i < 7; i++) {
                userId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return userId;
        };

        let newUserId;
        let isUnique = false;
        while (!isUnique) {
            newUserId = generateUserId();
            const checkId = await query("SELECT * FROM users WHERE user_id = ?", [newUserId]);
            if (checkId.length === 0) {
                isUnique = true;
            }
        }

        // ✅ Insert new user with `user_id`
        await query("INSERT INTO users (user_id, email, password_hash) VALUES (?, ?, ?)", 
                    [newUserId, email, hashedPassword]);

        res.json({ message: "Signup successful! Redirecting to login." });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});






app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
