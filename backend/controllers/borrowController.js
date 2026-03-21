const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

exports.issueBook = async (req, res) => {
  try {
    const db = getDb();
    const { userId, bookId } = req.body;
    const book = await db.collection('books').findOne({ _id: new ObjectId(bookId) });
    if (!book || book.available < 1)
      return res.status(400).json({ message: 'Book not available' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const result = await db.collection('borrows').insertOne({
      user: new ObjectId(userId),
      book: new ObjectId(bookId),
      issueDate: new Date(),
      dueDate,
      returnDate: null,
      status: 'borrowed'
    });

    await db.collection('books').updateOne(
      { _id: new ObjectId(bookId) },
      { $inc: { available: -1, borrowCount: 1 } }
    );

    res.status(201).json({ _id: result.insertedId, userId, bookId, dueDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const db = getDb();
    const borrow = await db.collection('borrows').findOne({ _id: new ObjectId(req.params.id) });
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });

    const returnDate = new Date();
    await db.collection('borrows').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { returnDate, status: 'returned' } }
    );

    await db.collection('books').updateOne(
      { _id: borrow.book },
      { $inc: { available: 1 }, $pop: { reservedBy: -1 } }
    );

    const daysOverdue = Math.floor((returnDate - borrow.dueDate) / (1000 * 60 * 60 * 24));
    if (daysOverdue > 0) {
      await db.collection('fines').insertOne({
        user: borrow.user,
        borrow: borrow._id,
        amount: daysOverdue * 5,
        perDayCharge: 5,
        daysOverdue,
        status: 'pending',
        createdAt: new Date()
      });
    }

    res.json({ message: 'Book returned', daysOverdue: Math.max(0, daysOverdue) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllBorrows = async (req, res) => {
  try {
    const db = getDb();
    const borrows = await db.collection('borrows').aggregate([
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'book' } },
      { $unwind: '$user' },
      { $unwind: '$book' },
      { $project: { 'user.password': 0 } }
    ]).toArray();
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBorrows = async (req, res) => {
  try {
    const db = getDb();
    const borrows = await db.collection('borrows').aggregate([
      { $match: { user: new ObjectId(req.user.id) } },
      { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' }
    ]).toArray();
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOverdue = async (req, res) => {
  try {
    const db = getDb();
    const now = new Date();
    const borrows = await db.collection('borrows').aggregate([
      { $match: { status: 'borrowed', dueDate: { $lt: now } } },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'book' } },
      { $unwind: '$user' },
      { $unwind: '$book' }
    ]).toArray();

    const result = borrows.map(b => ({
      ...b,
      daysOverdue: Math.floor((now - b.dueDate) / (1000 * 60 * 60 * 24))
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};