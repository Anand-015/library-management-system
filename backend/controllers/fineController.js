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
    res.json(fines);
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
    res.json(fines);
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