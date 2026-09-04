// One-off data migration for Task 3 (branch rename): "Uganda" -> "Nairobi".
// Run once, after deploying the schema/code changes, against the LIVE database.
//
// Usage:
//   cd backend
//   MONGO_URI="<your production connection string>" node scripts/migrate-uganda-to-nairobi.js
//
// Safe to re-run: if nothing matches "Uganda" anymore, every collection just
// reports 0 modified and exits cleanly.

const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is not set. Pass it inline, e.g.:\n  MONGO_URI=\"...\" node scripts/migrate-uganda-to-nairobi.js");
    process.exit(1);
}

const COLLECTIONS = ["products", "orders", "users", "branches"];

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected. Migrating branch: \"Uganda\" -> \"Nairobi\" ...\n");

    let totalModified = 0;
    for (const name of COLLECTIONS) {
        const coll = mongoose.connection.collection(name);
        const result = await coll.updateMany({ branch: "Uganda" }, { $set: { branch: "Nairobi" } });
        console.log(`${name}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
        totalModified += result.modifiedCount;
    }

    console.log(`\nDone. ${totalModified} document(s) updated in total.`);
    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
