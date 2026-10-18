"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const localUri = "mongodb://127.0.0.1:27017/alem-cinema9";
const atlasUri = "mongodb+srv://kebededagi0_db_user:Bq2TqrPqBsoN0TMX@portfoliocluster.bsd5ahe.mongodb.net/alem-cinema?retryWrites=true&w=majority&appName=PortfolioCluster";
const migrateData = async () => {
    try {
        const localConn = await mongoose_1.default.createConnection(localUri).asPromise();
        const atlasConn = await mongoose_1.default.createConnection(atlasUri).asPromise();
        console.log("✅ Connected to both local and Atlas databases.");
        const collections = ["movies", "users", "halls", "shows", "theaterperformances", "bookings"];
        for (const collName of collections) {
            const localColl = localConn.collection(collName);
            const atlasColl = atlasConn.collection(collName);
            let data = await localColl.find({}).toArray();
            // Fix the "amaric" typo in the movies collection
            if (collName === "movies") {
                data = data.map((doc) => {
                    if (doc.language === "amaric" || doc.language === "amharic") {
                        doc.language = "Amharic";
                    }
                    return doc;
                });
            }
            if (data.length > 0) {
                // Drop the collection on Atlas first to remove any conflicting text indexes
                try {
                    await atlasColl.drop();
                    console.log(`Dropped existing ${collName} on Atlas.`);
                }
                catch (e) {
                    // Ignore if it doesn't exist
                }
                await atlasColl.insertMany(data);
                console.log(`✅ Migrated ${data.length} documents to ${collName}`);
            }
            else {
                console.log(`⚠️ No data found in local ${collName}`);
            }
        }
        console.log("🎉 Migration complete!");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
};
migrateData();
