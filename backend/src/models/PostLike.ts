import mongoose, { Document, Schema } from 'mongoose';

export interface IPostLike extends Document {
  userId: mongoose.Types.ObjectId;
  postId: string;
  platform: string;
  createdAt: Date;
}

const PostLikeSchema = new Schema<IPostLike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const PostLike = mongoose.model<IPostLike>('PostLike', PostLikeSchema);
