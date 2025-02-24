const bcrypt = require("bcryptjs");

async function hashPassword() {
    const plainPassword = "hashedpassword123"; // Use the actual password you want to hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    console.log("Hashed Password:", hashedPassword);
}

hashPassword();
