import { MongoClient, Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGO_URL!;
const dbName = process.env.DB_NAME!;

if (!global._mongoClient) {
  global._mongoClient = new MongoClient(uri, { maxPoolSize: 20 });
}
const client = global._mongoClient;

export async function getDb(): Promise<Db> {
  await client.connect();
  return client.db(dbName);
}
