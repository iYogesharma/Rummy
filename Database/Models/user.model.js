const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  lnId:{ type: String, unique: true },
  balance: { type: Number, default: 1000},
  active: {type: Boolean,default: true},
  created_at: { type: Date},
  updated_at: { type: Date, default: null },
});

const User = model("User", userSchema);
module.exports = User;
