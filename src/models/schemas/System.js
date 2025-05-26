import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const roles = [
  'developer',
  'super_admin',
  'admin',
  'database_moderator',
  'discord_moderator',
  'moderator',
  'community_manager',
  'support',
  'contributor',
  'tester',
  'beta_tester',
  'alpha_tester',
  'translator',
  'sponsor',
  'member',
  'user',
  'guest',
];

const SystemSchema = new Schema({
  _id: String,
  membership: {
    features: [],
    plans: [
      {
        _id: String,
        name: { type: String, required: true, unique: true },
        monthlyPrice: { type: Number, required: true },
        annualPrice: { type: Number, required: true },
        current: Boolean,
        available: Boolean,
        features: [
          {
            text: String,
            status: { type: String, enum: ['available', 'limited', 'unavailable'] },
          },
        ],
      },
    ],
  },
  pages: [
    {
      _id: { type: String, required: true, unique: true },
      available: { type: Boolean, default: true },
      type: { type: String, enum: ['production', 'alpha', 'beta'], required: true },
      maintenance: {
        status: { type: Boolean, default: false },
        message: { type: String, default: 'Page is under maintenance. Please try again later.' },
      },
      permission: {
        roles: [
          {
            type: String,
            enum: roles,
            required: true,
            default: ['user'],
          },
        ],
      },
      content: {
        available: { type: Boolean, default: true },
        service: {
          available: { type: Boolean, default: true },
          message: String,
        },
        maintenance: {
          status: { type: Boolean, default: false },
          message: { type: String, default: 'Page is under maintenance. Please try again later.' },
        },
        permission: {
          roles: [
            {
              type: String,
              enum: roles,
              required: true,
              default: ['user'],
            },
          ],
        },
      },
    },
  ],
  rewards: [
    {
      _id: { type: String, required: true, unique: true }, // Unique code like "SUMMER2025"
      type: { type: String, enum: ['giftcard', 'coupon', 'voucher'], required: true },
      description: String,
      discount: {
        type: { type: String, enum: ['percentage', 'fixed'], required: true },
        value: { type: Number, required: true }, // e.g., 20 for 20% or $20
      },
      appliesTo: {
        plans: [String], // Array of plan IDs it can be applied to, if any
        roles: [String], // Optionally apply by role
      },
      usage: {
        maxRedemptions: { type: Number, default: 1 }, // How many times this code can be used globally
        usedBy: [
          {
            userId: String,
            redeemedAt: Date,
          },
        ],
      },
      validFrom: Date,
      validUntil: Date,
      isActive: { type: Boolean, default: true },
    },
  ],
});

export default model('System', SystemSchema);
