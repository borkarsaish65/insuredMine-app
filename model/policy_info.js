const mongoose = require('mongoose');
const User = require('./user');

const PolicySchema = new mongoose.Schema({
  policy_number: {
    type: String,
    required: true,
  },
  premium_amount: Number,
  producer: String,
  policy_type: String,
  policy_start_date: Date,
  policy_end_date: Date,
  csr:String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
});

module.exports = mongoose.model('Policy', PolicySchema);
