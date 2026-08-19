import { MongoClient, Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

function getClient(): MongoClient {
  const uri = process.env.MONGO_URL!;
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
  const dbName = process.env.DB_NAME!;
  const client = getClient();
  await client.connect();
  return client.db(dbName);
}
