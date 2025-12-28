import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["deposit", "withdraw", "gift_sent", "gift_received", "game_bet", "game_win", "game_loss"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  relatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  // Payment gateway fields
  paymentId: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  gateway: {
    type: String,
    default: null, // "oxapay", etc.
  },
  gatewayTransactionId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

