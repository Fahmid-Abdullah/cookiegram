import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, unique: true, required: true },
  followers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  followings: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  description: { type: String, required: true, default: "I love birthday cakes." },
  posts: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Post' } ]
}, { collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;