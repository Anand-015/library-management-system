const { MongoClient } = require('mongodb');

let db;

const connectDB = async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db('libraryms');
  console.log('MongoDB connected');
};

const getDb = () => db;

module.exports = { connectDB, getDb };