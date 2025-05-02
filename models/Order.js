const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: String,
  paymentId: String,
  amount: Number,
  name: String,
  email: String,
  phone: String,
  address: String,
  status: { type: String, default: "Pending" }
});


module.exports = mongoose.model("Order", orderSchema);
