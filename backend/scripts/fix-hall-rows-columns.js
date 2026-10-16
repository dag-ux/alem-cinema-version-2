const mongoose = require('mongoose');

// Simple function to update Hall 1
async function fixHalls() {
  console.log('🚀 Starting hall fix...');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/alem-cinema');
    console.log('✅ Connected to MongoDB');

    // Get the Hall model
    const Hall = mongoose.model('Hall', new mongoose.Schema({
      hallNumber: String,
      rows: Number,
      columns: Number,
      capacity: Number,
      type: String,
      isActive: Boolean,
    }, { timestamps: true }));

    // Check if Hall 1 exists
    console.log('📋 Checking for Hall 1...');
    let hall = await Hall.findOne({ hallNumber: 'Hall 1' });
    
    if (!hall) {
      console.log('⚠️ Hall 1 not found. Creating it...');
      hall = new Hall({
        hallNumber: 'Hall 1',
        rows: 10,
        columns: 12,
        capacity: 120,
        type: 'STANDARD',
        isActive: true,
      });
      await hall.save();
      console.log('✅ Hall 1 created!');
    } else {
      console.log(`📋 Found Hall 1: rows=${hall.rows}, columns=${hall.columns}, capacity=${hall.capacity}`);
      
      // Update Hall 1 with rows and columns
      console.log('📝 Updating Hall 1...');
      hall.rows = 10;
      hall.columns = 12;
      hall.capacity = 120;
      hall.type = 'STANDARD';
      await hall.save();
      console.log('✅ Hall 1 updated!');
    }

    // Verify the update
    const updatedHall = await Hall.findOne({ hallNumber: 'Hall 1' });
    console.log(`\n✅ Final Hall 1: ${updatedHall.rows}x${updatedHall.columns} = ${updatedHall.capacity} seats`);

    // Show all halls
    const allHalls = await Hall.find();
    console.log(`\n📋 All Halls:`);
    allHalls.forEach(h => {
      console.log(`  - ${h.hallNumber}: ${h.rows || 'N/A'}x${h.columns || 'N/A'} = ${h.capacity || 'N/A'} seats`);
    });

    console.log('\n✅ Done!');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the function
fixHalls();