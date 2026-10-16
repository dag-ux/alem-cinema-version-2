const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/alem-cinema9")
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("movies");

    // Count movies missing the industry field
    const missingCount = await collection.countDocuments({
      industry: { $exists: false },
    });

    console.log(`📦 Found ${missingCount} movies without industry field`);

    if (missingCount === 0) {
      console.log("✅ All movies already have the industry field");
      process.exit(0);
    }

    // Add industry field (default = ETHIOPIAN)
    const result = await collection.updateMany(
      { industry: { $exists: false } },
      { $set: { industry: "ETHIOPIAN" } }
    );

    console.log(`✅ Updated ${result.modifiedCount} movies`);

    // Show all movies to verify
    const movies = await collection.find({}, { projection: { title: 1, industry: 1 } }).toArray();
    console.log("\n📽️ Current movies:");
    movies.forEach((m) => console.log(`   ${m.industry || "❌ NONE"} - ${m.title}`));

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });