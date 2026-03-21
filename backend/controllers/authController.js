const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

exports.register = async (req, res) => {
  try {
    const db = getDb();
    const { name, email, password, role, phone, address } = req.body;
    const exists = await db.collection('users').findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      name, email, password: hashed, role: role || 'member',
      phone, address, isActive: true,
      createdAt: new Date()
    });

    const user = { id: result.insertedId, name, email, role: role || 'member' };
    const token = jwt.sign({ id: result.insertedId, role: role || 'member' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const db = getDb();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const db = getDb();
    const { name, phone, address } = req.body;
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { name, phone, address } }
    );
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};