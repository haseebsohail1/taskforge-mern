import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer | undefined;

jest.setTimeout(20000);

beforeAll(async () => {
  const externalUri = process.env.MONGO_URI_TEST;
  if (externalUri) {
    await mongoose.connect(externalUri);
    return;
  }
  process.env.MONGOMS_IP = '127.0.0.1';
  mongo = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
      port: 0,
    },
  });
  const uri = mongo.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const db = mongoose.connection.db;
  if (!db) {
    return;
  }
  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
});
