const bcrypt = require("bcryptjs");

const passwords = ["hamilton"];
const saltRounds = 10;

passwords.forEach(async (password) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Original: ${password} -> Hashed: ${hashedPassword}`);
});
