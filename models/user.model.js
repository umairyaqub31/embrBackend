const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  name : {
      type : String,
      required : true
  },
  email : {
      type : String,
      required : true,
  },
  address : {
    type : String,
    required : true,
  },
  password : {
      type : String,
      required : true,
      min : 6,
      max : 1024
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;