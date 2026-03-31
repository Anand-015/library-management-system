const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

exports.addBook = async (req, res) => {
  try {
    const db = getDb();
    const { title, author, genre, ISBN, quantity } = req.body;
    const result = await db.collection('books').insertOne({
      title, author, genre, ISBN,
      quantity: parseInt(quantity),
      available: parseInt(quantity),
      borrowCount: 0,
      reservedBy: [],
      createdAt: new Date()
    });
    res.status(201).json({ _id: result.insertedId, title, author, genre, ISBN, quantity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const db = getDb();
    const { search, genre } = req.query;
    let query = {};
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { author: { $regex: search, $options: 'i' } },
      { ISBN: { $regex: search, $options: 'i' } }
    ];
    if (genre) query.genre = { $regex: genre, $options: 'i' };
    const books = await db.collection('books').find(query).toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBook = async (req, res) => {
  try {
    const db = getDb();
    const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('books').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('books').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reserveBook = async (req, res) => {
  try {
    const db = getDb();
    const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.reservedBy.includes(req.user.id))
      return res.status(400).json({ message: 'Already reserved' });
    await db.collection('books').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $push: { reservedBy: req.user.id } }
    );
    res.json({ message: 'Book reserved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.requestBook = async (req, res) => {
  try {
    const db = getDb();
    const bookId = req.params.id;
    const userId = req.user.id;

    const book = await db.collection('books').findOne({ _id: new ObjectId(bookId) });
    if (!book || book.available < 1) {
      return res.status(400).json({ message: 'Book not available for request' });
    }

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