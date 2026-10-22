import mongoose, { Document, Schema } from 'mongoose';
import { SocialPlatform } from '../types';
import { encryptToken, decryptToken } from '../utils/crypto';

export interface ISocialAccount extends Document {
  userId: mongoose.Types.ObjectId;
  platform: SocialPlatform;
  platformUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  accessToken: string; // encrypted
  refreshToken?: string; // encrypted
  tokenExpiresAt?: Date;
  scopes: string[];
  isMock: boolean;
  isActive: boolean;
  connectedAt: Date;
  lastSyncedAt?: Date;
  rawProfile?: any;
  getDecryptedAccessToken(): string;
  getDecryptedRefreshToken(): string;
}

const SocialAccountSchema = new Schema<ISocialAccount>(
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
    platformUserId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      default: '',
    },
    tokenExpiresAt: {
      type: Date,
    },
    scopes: {
      type: [String],
      default: [],
    },
    isMock: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastSyncedAt: {
      type: Date,
    },
    rawProfile: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Compound index to ensure a user only has one active connection per platform
SocialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

// Auto-encrypt tokens before saving
SocialAccountSchema.pre('save', function (next) {
  if (this.isModified('accessToken') && this.accessToken) {
    this.accessToken = encryptToken(this.accessToken);
  }
  if (this.isModified('refreshToken') && this.refreshToken) {
    this.refreshToken = encryptToken(this.refreshToken);
  }
  next();
});

SocialAccountSchema.methods.getDecryptedAccessToken = function (): string {
  return decryptToken(this.accessToken);
};

SocialAccountSchema.methods.getDecryptedRefreshToken = function (): string {
  return this.refreshToken ? decryptToken(this.refreshToken) : '';
};

export const SocialAccount = mongoose.model<ISocialAccount>('SocialAccount', SocialAccountSchema);
