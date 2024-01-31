const { Schema, model } = require("mongoose");

const invoiceSchema = new Schema({
  user_id:[
    {type: Schema.Types.ObjectId, ref: 'User'}
  ],
  paymentHash:{ type: String},
  paymentRequest:{ type: String,  unique: true},
  amount: { type: Number, default: 0},
  expires_at: { type: Date,  default: null},
  type:{ type: String},
  setteled: { type: Boolean, default:0},
  created_at: { type: Date},
  updated_at: { type: Date, default: null },
});

const Invoice = model("Invoice", invoiceSchema);
module.exports = Invoice;
