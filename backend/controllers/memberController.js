const User = require('../models/user');

exports.getMembers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'member' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const members = await User.find(query).select('-password');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMember = async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('-password');
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const member = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleMemberStatus = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    member.isActive = !member.isActive;
    await member.save();
    res.json({ message: `Member ${member.isActive ? 'activated' : 'deactivated'}`, isActive: member.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};