const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/alem-cinema');
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
}

// Update halls
async function updateHalls() {
  console.log('🚀 Starting hall update...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Get the Hall model
    const Hall = mongoose.model('Hall', new mongoose.Schema({
      hallNumber: String,
      rows: Number,
      columns: Number,
      capacity: Number,
      type: String,
      isActive: Boolean,
    }, { timestamps: true }));

    // Find all halls
    const halls = await Hall.find();
    console.log(`📋 Found ${halls.length} halls in database`);

    if (halls.length === 0) {
      console.log('⚠️ No halls found. Creating default halls...');
      
      const defaultHalls = [
        { hallNumber: 'Hall 1', rows: 10, columns: 12, capacity: 120, type: 'STANDARD', isActive: true },
        { hallNumber: 'Hall 2', rows: 10, columns: 12, capacity: 120, type: 'STANDARD', isActive: true },
        { hallNumber: 'VIP Hall', rows: 8, columns: 10, capacity: 80, type: 'VIP', isActive: true },
      ];
      
      await Hall.insertMany(defaultHalls);
      console.log('✅ Created 3 default halls');
      
      const newHalls = await Hall.find();
      console.log(`📋 Now have ${newHalls.length} halls`);
      newHalls.forEach(h => {
        console.log(`  - ${h.hallNumber}: ${h.rows}x${h.columns} = ${h.capacity} seats`);
      });
      
      await mongoose.disconnect();
      process.exit(0);
    }

    // Update each hall
    let updatedCount = 0;
    let skippedCount = 0;

    for (const hall of halls) {
      console.log(`\n📌 Processing: ${hall.hallNumber}`);
      console.log(`   Current: rows=${hall.rows}, columns=${hall.columns}, capacity=${hall.capacity}`);

      let needsUpdate = false;
      const updates = {};

      // Check if rows is missing or invalid
      if (!hall.rows || hall.rows === 0) {
        updates.rows = 10;
        needsUpdate = true;
        console.log(`   ⚠️ Missing rows, setting to 10`);
      }

      // Check if columns is missing or invalid
      if (!hall.columns || hall.columns === 0) {
        updates.columns = 12;
        needsUpdate = true;
        console.log(`   ⚠️ Missing columns, setting to 12`);
      }

      // Check if capacity is missing or invalid
      if (!hall.capacity || hall.capacity === 0) {
        const rows = hall.rows || 10;
        const columns = hall.columns || 12;
        updates.capacity = rows * columns;
        needsUpdate = true;
        console.log(`   ⚠️ Missing capacity, calculating as ${rows} × ${columns} = ${updates.capacity}`);
      }

      if (needsUpdate) {
        await Hall.findByIdAndUpdate(hall._id, { $set: updates });
        updatedCount++;
        console.log(`   ✅ Updated: ${hall.hallNumber}`);
        
        // Verify update
        const updated = await Hall.findById(hall._id);
        console.log(`   ✅ New values: rows=${updated.rows}, columns=${updated.columns}, capacity=${updated.capacity}`);
      } else {
        skippedCount++;
        console.log(`   ✅ Already up to date`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} halls`);
    console.log(`   ⏭️ Skipped: ${skippedCount} halls`);
    console.log(`   📋 Total: ${halls.length} halls`);

    // Show all halls after update
    const finalHalls = await Hall.find();
    console.log(`\n📋 Final Halls:`);
    finalHalls.forEach(h => {
      console.log(`  - ${h.hallNumber}: ${h.rows}x${h.columns} = ${h.capacity} seats (${h.type || 'STANDARD'})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the update
updateHalls();