const Fine = require('../models/fine');

exports.getFines = async (req, res) => {
  try {
    const fines = await Fine.find().populate('user', 'name email').populate('borrow');
    res.json(fines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyFines = async (req, res) => {
  try {
    const fines = await Fine.find({ user: req.user.id }).populate('borrow');
    res.json(fines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.payFine = async (req, res) => {
  try {
    const fine = await Fine.findByIdAndUpdate(
      req.params.id, { status: 'paid', paidAt: new Date() }, { new: true }
    );
    res.json(fine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.waiveFine = async (req, res) => {
  try {
    const { reason } = req.body;
    const fine = await Fine.findByIdAndUpdate(
      req.params.id,
      { status: 'waived', waivedBy: req.user.id, waiverReason: reason },
      { new: true }
    );
    res.json(fine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};