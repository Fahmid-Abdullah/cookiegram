import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageLink: { type: String, required: true },
    description: { type: String },
    recipe: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    created_at: { type: Date, required: true, default: Date.now },
}, { collection: 'posts' });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
