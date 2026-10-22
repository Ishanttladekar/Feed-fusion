import mongoose, { Document, Schema } from 'mongoose';
import { FeedPost } from '../types';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  postId: string;
  platform: string;
  post: FeedPost;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
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
    post: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

BookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
