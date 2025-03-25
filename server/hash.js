const bcrypt = require("bcryptjs");

// Admin password
const password = "testing";  // Replace with the desired admin password
const saltRounds = 10;

// Hashing the admin password
bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
        console.error("Error hashing password:", err);
    } else {
        console.log(`Original: ${password} -> Hashed: ${hashedPassword}`);
    }
});
