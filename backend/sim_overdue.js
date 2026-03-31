const { MongoClient, ObjectId } = require('mongodb');
async function main() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('libraryms');
  
  // Update a specific borrow to have a dueDate 3 days in the past
  await db.collection('borrows').updateOne(
    { _id: new ObjectId('69cabf1bf2731977fe6c91b7') },
    { $set: { dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } }
  );
  
  console.log('Updated borrow to be 3 days overdue');
  await client.close();
}
main().catch(console.error);
