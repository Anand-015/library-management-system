const Borrow = require('../models/borrow');
const Book = require('../models/book');
const Fine = require('../models/fine');

exports.issueBook = async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.available < 1)
      return res.status(400).json({ message: 'Book not available' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({ user: userId, book: bookId, dueDate });
    book.available -= 1;
    book.borrowCount += 1;
    await book.save();

    res.status(201).json(borrow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });

    borrow.returnDate = new Date();
    borrow.status = 'returned';
    await borrow.save();

    const book = await Book.findById(borrow.book);
    book.available += 1;

    const firstReserved = book.reservedBy.shift();
    await book.save();

    const daysOverdue = Math.floor((borrow.returnDate - borrow.dueDate) / (1000 * 60 * 60 * 24));
    if (daysOverdue > 0) {
      const perDayCharge = 5;
      await Fine.create({
        user: borrow.user, borrow: borrow._id,
        amount: daysOverdue * perDayCharge,
        perDayCharge, daysOverdue
      });
    }

    res.json({ message: 'Book returned', daysOverdue: Math.max(0, daysOverdue) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find().populate('user', 'name email').populate('book', 'title author');
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user.id }).populate('book', 'title author ISBN');
    res.json(borrows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOverdue = async (req, res) => {
  try {
    const now = new Date();
    const borrows = await Borrow.find({ status: 'borrowed', dueDate: { $lt: now } })
      .populate('user', 'name email')
      .populate('book', 'title author');
    const result = borrows.map(b => ({
      ...b._doc,
      daysOverdue: Math.floor((now - b.dueDate) / (1000 * 60 * 60 * 24))
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};