const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  account_name: {
    type: String,
    required: true,
  },
  firstname: String,
  gender: String,
  email: String,
  phone: String,
  dob: Date,
  account_type: String,
  address: String,
  city: String,
  state: String,
  zip: String,
});


module.exports = mongoose.model('User', UserSchema);
