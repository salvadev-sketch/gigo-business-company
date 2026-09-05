// Sets (or resets) one user's password directly in the database.
//
// Needed because accounts created before the Firebase -> JWT/bcrypt
// migration have no password hash at all (the field defaults to ""), so
// they're locked out of POST /auth/login until a password is set for them
// this way. Also useful as a manual admin-assisted "forgot password" until
// a self-serve reset flow exists.
//
// Usage:
//   cd backend
//   MONGO_URI="<connection string>" node scripts/set-user-password.js <email> <newPassword>
//
// Example:
//   MONGO_URI="mongodb+srv://..." node scripts/set-user-password.js owner@gigo.com "TempPass123!"

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI;
const [, , email, newPassword] = process.argv;

if (!MONGO_URI) {
    console.error('MONGO_URI is not set. Usage:\n  MONGO_URI="..." node scripts/set-user-password.js <email> <newPassword>');
    process.exit(1);
}
if (!email || !newPassword) {
    console.error('Missing arguments. Usage:\n  MONGO_URI="..." node scripts/set-user-password.js <email> <newPassword>');
    process.exit(1);
}
if (newPassword.length < 6) {
    console.error("Password must be at least 6 characters (same rule POST /auth/register enforces).");
    process.exit(1);
}

async function run() {
    await mongoose.connect(MONGO_URI);

    const user = await User.findOne({ email });
    if (!user) {
        console.error(`No user found with email "${email}". Nothing changed.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log(`Password set for ${email} (role: ${user.role}, branch: ${user.branch}).`);
    console.log("They can now log in with the password you just set. Ask them to change it once a self-serve reset flow exists.");

    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error("Failed to set password:", err);
    process.exit(1);
});
