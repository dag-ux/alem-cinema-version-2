const mongoose = require('mongoose');

// ─── Connect to MongoDB ──────────────────────────────────────
mongoose.connect('mongodb://localhost:27017/alem-cinema9')
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // ─── Get the Show model ──────────────────────────────────
    const Show = mongoose.model('Show', new mongoose.Schema({
      date: mongoose.Schema.Types.Mixed, // allow both Date and String temporarily
      // other fields not needed
    }, { collection: 'shows' }));

    // ─── Find all shows ──────────────────────────────────────
    const shows = await Show.find({});
    console.log(`📦 Found ${shows.length} shows to process`);

    let updated = 0;

    for (const show of shows) {
      // Only convert if date is a Date object
      if (show.date instanceof Date) {
        // Convert to EAT date string (YYYY-MM-DD)
        const eatDate = new Date(show.date.getTime() + 3 * 60 * 60 * 1000);
        const year = eatDate.getFullYear();
        const month = String(eatDate.getMonth() + 1).padStart(2, '0');
        const day = String(eatDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Update the document
        await Show.updateOne(
          { _id: show._id },
          { $set: { date: dateStr } }
        );
        updated++;
        console.log(`🔄 ${show._id}: ${show.date} → ${dateStr}`);
      }
    }

    console.log(`✅ Converted ${updated} shows`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });