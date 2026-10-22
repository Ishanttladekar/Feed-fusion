import mongoose, { Document, Schema } from 'mongoose';
import { SocialPlatform } from '../types';

export interface IFollowedAccount extends Document {
  userId: mongoose.Types.ObjectId;
  platform: SocialPlatform;
  handle: string;
  displayName: string;
  avatarUrl: string;
  createdAt: Date;
}

const FollowedAccountSchema = new Schema<IFollowedAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['twitter', 'instagram', 'facebook'],
      required: true,
    },
    handle: {
      type: String,
      required: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

FollowedAccountSchema.index({ userId: 1, platform: 1, handle: 1 }, { unique: true });

export const FollowedAccount = mongoose.model<IFollowedAccount>('FollowedAccount', FollowedAccountSchema);
