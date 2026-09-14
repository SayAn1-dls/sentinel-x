import { MongoClient, Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

function getClient(): MongoClient {
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error(
      'MONGO_URL environment variable is not configured. ' +
      'Database features are unavailable until a MongoDB connection string is provided.'
    );
  }
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 8000,
    });
  }
  return global._mongoClient;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.DB_NAME || 'sentinel';
  const client = getClient();
  await client.connect();
  return client.db(dbName);
}
