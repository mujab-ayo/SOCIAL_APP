const mongoose = require("mongoose");

const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(120000); 

let mongoServer;

const connectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());
};

const clearTestDB = async () => {
  const { collections } = mongoose.connection;

  await Promise.all(
    Object.keys(collections).map((key) => collections[key].deleteMany({})),
  );
};

const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

module.exports = {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
};
