const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

exports.getMembers = async (req, res) => {
  try {
    const db = getDb();
    const { search } = req.query;
    let query = { role: 'member' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const members = await db.collection('users').find(query, { projection: { password: 0 } }).toArray();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMember = async (req, res) => {
  try {
    const db = getDb();
    const member = await db.collection('users').findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { password: 0 } }
    );
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const db = getDb();
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    const member = await db.collection('users').findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { password: 0 } }
    );
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleMemberStatus = async (req, res) => {
  try {
    const db = getDb();
    const member = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isActive: !member.isActive } }
    );
    res.json({ message: `Member ${!member.isActive ? 'activated' : 'deactivated'}`, isActive: !member.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};