import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

let cachedClient: MongoClient;
let cachedDb: Db;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

if (!dbName) {
  throw new Error(
    "Please define the MONGODB_DB environment variable inside .env.local",
  );
}

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri, {
    maxIdleTimeMS: 10 * 60 * 1000,
    maxPoolSize: 10,
  });

  const db = await client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export { connectToDatabase };
