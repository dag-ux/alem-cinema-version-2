const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/alem-cinema9")
  .then(async () => {
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const collection = db.collection("movies");

    // Get total count
    const total = await collection.countDocuments();
    console.log(`📦 Total movies in database: ${total}\n`);

    // List all movies with their fields
    const movies = await collection.find({}).toArray();

    console.log("📽️ Movie list:");
    console.log("─".repeat(80));

    movies.forEach((m, i) => {
      console.log(`${i + 1}. ${m.title}`);
      console.log(`   Industry: ${m.industry || "❌ MISSING"}`);
      console.log(`   Status:   ${m.status || "❌ MISSING"}`);
      console.log(`   Language: ${m.language || "❌ MISSING"}`);
      console.log("");
    });

    console.log("─".repeat(80));

    // Check how many have industry
    const withIndustry = await collection.countDocuments({ industry: { $exists: true } });
    const withoutIndustry = await collection.countDocuments({ industry: { $exists: false } });

    console.log(`✅ With industry field:    ${withIndustry}`);
    console.log(`❌ Without industry field: ${withoutIndustry}`);

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });