const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: { type: String,  default: null },
  email: { type: String, unique: true },
  email_validated: { type: Boolean, default: false },
  password: { type: String,  default: null },
  phoneNumber: { type: Number, default: null},
  provider: { type: String, default: null },
  providerId: { type: String,  unique: true, default: null },
  accessToken: { type: String,  default: null },
  refreshToken: { type: String,  default: null },
  tokenExpiry: { type: Date, default: null},
  lightningAddress: { type: String, default: null},
  role: [
    {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  ],
  active: {type: Boolean,default: false},
  created_at: { type: Date},
  updated_at: { type: Date, default: null },
});

const User = model("User", userSchema);
module.exports = User;
