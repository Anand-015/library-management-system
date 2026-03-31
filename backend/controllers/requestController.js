const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

exports.createRequest = async (req, res) => {
  try {
    const db = getDb();
    const { bookId } = req.body;
    const userId = req.user.id;

    const book = await db.collection('books').findOne({ _id: new ObjectId(bookId) });
    if (!book || book.available < 1) {
      return res.status(400).json({ message: 'Book not available for request' });
    }

    // Check if user already requested this book and it's pending
    const existingReq = await db.collection('requests').findOne({
      user: new ObjectId(userId),
      book: new ObjectId(bookId),
      status: 'Pending'
    });
    
    if (existingReq) {
      return res.status(400).json({ message: 'You have already requested this book' });
    }

    const result = await db.collection('requests').insertOne({
      user: new ObjectId(userId),
      book: new ObjectId(bookId),
      status: 'Pending',
      createdAt: new Date(),
    });

    res.status(201).json({ _id: result.insertedId, message: 'Book requested successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const db = getDb();
    let query = {};
    
    if (req.user.role === 'admin') {
      // Admins see pending requests only
      query.status = 'Pending';
    } else {
      // Members see their own requests
      query.user = new ObjectId(req.user.id);
    }

    const requests = await db.collection('requests').aggregate([
      { $match: query },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userObj' } },
      { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'bookObj' } },
      { $unwind: '$userObj' },
      { $unwind: '$bookObj' },
      { $project: { 'userObj.password': 0 } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    // Map `userObj` back to `user` (as object) and `bookObj` to `book` for easier frontend use
    const formattedRequests = requests.map(r => ({
      ...r,
      user: r.userObj,
      book: r.bookObj,
      userObj: undefined,
      bookObj: undefined
    }));

    res.json(formattedRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body; // 'Approved' or 'Rejected'
    const requestId = req.params.id;

    if (!['Approved', 'Rejected'].includes(status)) {
         return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await db.collection('requests').findOne({ _id: new ObjectId(requestId) });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Request already processed' });

    if (status === 'Approved') {
      const book = await db.collection('books').findOne({ _id: request.book });
      if (!book || book.available < 1) {
        return res.status(400).json({ message: 'Book no longer available. Cannot approve.' });
      }

      // Create borrow record
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      await db.collection('borrows').insertOne({
        user: request.user,
        book: request.book,
        issueDate: new Date(),
        dueDate,
        returnDate: null,
        status: 'borrowed'
      });

      // Update book availability
      await db.collection('books').updateOne(
        { _id: request.book },
        { $inc: { available: -1, borrowCount: 1 } }
      );
    }

    // Update request status
    await db.collection('requests').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { status, processedAt: new Date() } }
    );

    res.json({ message: `Request ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
