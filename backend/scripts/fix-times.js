const mongoose = require('mongoose');

// ─── Connect to MongoDB ────────────────────────────────────
mongoose.connect('mongodb://localhost:27017/alem-cinema9')
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // ─── Helper: Convert standard hour to Ethiopian ──────
    function toEthiopianTime(hour) {
      let eth = hour - 6;
      if (eth < 0) eth += 24;
      let period = 'ጠዋት';
      if (eth >= 0 && eth < 6) period = 'ሌሊት';
      else if (eth >= 6 && eth < 12) period = 'ጠዋት';
      else if (eth >= 12 && eth < 18) period = 'ከሰዓት';
      else period = 'ማታ';
      const h12 = eth % 12 || 12;
      return `${h12}:00 ${period}`;
    }

    // ─── Get the Show model ──────────────────────────────
    // We'll use the raw collection to avoid model validation
    const collection = mongoose.connection.collection('shows');
    const shows = await collection.find({}).toArray();
    console.log(`📦 Found ${shows.length} shows`);

    let count = 0;
    for (const show of shows) {
      const update = {};
      let changed = false;

      if (show.startTime && !/[ሀ-ፐ]/.test(show.startTime)) {
        const hour = parseInt(show.startTime.split(':')[0]);
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          update.startTime = toEthiopianTime(hour);
          changed = true;
          console.log(`🔄 ${show._id}: start ${show.startTime} → ${update.startTime}`);
        }
      }

      if (show.endTime && !/[ሀ-ፐ]/.test(show.endTime)) {
        const hour = parseInt(show.endTime.split(':')[0]);
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          update.endTime = toEthiopianTime(hour);
          changed = true;
          console.log(`🔄 ${show._id}: end   ${show.endTime} → ${update.endTime}`);
        }
      }

      if (changed) {
        await collection.updateOne({ _id: show._id }, { $set: update });
        count++;
      }
    }

    console.log(`✅ Updated ${count} shows`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });