import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    created_at: { type: Date, required: true, default: Date.now },
}, { collection: 'comments' });

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment;
