const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

exports.getFines = async (req, res) => {
  try {
    const db = getDb();
    const fines = await db.collection('fines').aggregate([
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $lookup: { from: 'borrows', localField: 'borrow', foreignField: '_id', as: 'borrow' } },
      { $unwind: '$user' },
      { $unwind: '$borrow' },
      { $project: { 'user.password': 0 } }
    ]).toArray();

    const now = new Date();
    const overdueBorrows = await db.collection('borrows').aggregate([
      { $match: { status: 'borrowed', dueDate: { $lt: now } } },
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'book' } },
      { $unwind: '$user' },
      { $unwind: '$book' },
      { $project: { 'user.password': 0 } }
    ]).toArray();

    const accruingFines = overdueBorrows.map(borrow => {
      const daysOverdue = Math.floor((now - borrow.dueDate) / (1000 * 60 * 60 * 24));
      return {
        _id: 'accruing_' + borrow._id.toString(),
        user: borrow.user,
        borrow: borrow,
        amount: daysOverdue * 5,
        daysOverdue: daysOverdue,
        status: 'accruing'
      };
    }).filter(fine => fine.daysOverdue > 0);

    res.json([...fines, ...accruingFines]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyFines = async (req, res) => {
  try {
    const db = getDb();
    const fines = await db.collection('fines').aggregate([
      { $match: { user: new ObjectId(req.user.id) } },
      { $lookup: { from: 'borrows', localField: 'borrow', foreignField: '_id', as: 'borrow' } },
      { $unwind: '$borrow' }
    ]).toArray();

    const now = new Date();
    const overdueBorrows = await db.collection('borrows').aggregate([
      { $match: { user: new ObjectId(req.user.id), status: 'borrowed', dueDate: { $lt: now } } },
      { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'book' } },
      { $unwind: '$book' }
    ]).toArray();

    const accruingFines = overdueBorrows.map(borrow => {
      const daysOverdue = Math.floor((now - borrow.dueDate) / (1000 * 60 * 60 * 24));
      return {
        _id: 'accruing_' + borrow._id.toString(),
        user: borrow.user, // for admin compatibility if needed
        borrow: borrow,
        amount: daysOverdue * 5,
        daysOverdue: daysOverdue,
        status: 'accruing'
      };
    }).filter(fine => fine.daysOverdue > 0);

    res.json([...fines, ...accruingFines]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.payFine = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('fines').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'paid', paidAt: new Date() } }
    );
    const fine = await db.collection('fines').findOne({ _id: new ObjectId(req.params.id) });
    res.json(fine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.waiveFine = async (req, res) => {
  try {
    const db = getDb();
    const { reason } = req.body;
    await db.collection('fines').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'waived', waivedBy: new ObjectId(req.user.id), waiverReason: reason } }
    );
    const fine = await db.collection('fines').findOne({ _id: new ObjectId(req.params.id) });
    res.json(fine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};