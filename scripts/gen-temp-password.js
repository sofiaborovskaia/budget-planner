// Quick script to generate a bcrypt hash for migration
const bcrypt = require("bcryptjs");

async function hashPassword() {
  // Temporary password: "changeme123"
  // This will be used for existing users, who should change it on first login
  const hash = await bcrypt.hash("changeme123", 10);
  console.log("Hashed password:", hash);
}

hashPassword();
