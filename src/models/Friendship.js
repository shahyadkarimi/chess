const FriendshipSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});

export default mongoose.models.Friendship ||
  mongoose.model("Friendship", FriendshipSchema);
