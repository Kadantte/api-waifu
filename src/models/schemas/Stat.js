import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const StatSchema = new Schema({
  _id: { type: String, required: true, default: 'system' },
  total_requests: { type: Number, default: 0 },
  endpoints_requests: { type: Number, default: 0 },
  failed_requests: { type: Number, default: 0 },
  success_requests: { type: Number, default: 0 },
  banned_requests: { type: Number, default: 0 },
  daily_requests: { type: Number, default: 0 },
  endpoints: {
    type: Map,
    of: { type: Number, default: 0 },
    default: {},
  },
  daily: {
    type: Map,
    of: {
      total_requests: { type: Number, default: 0 },
      failed_requests: { type: Number, default: 0 },
      success_requests: { type: Number, default: 0 },
      endpoints: {
        type: Map,
        of: { type: Number, default: 0 }, // Key: endpoint name (e.g., "login"), Value: request count
      },
    },
    default: {},
  },
});

StatSchema.index({ 'endpoints.$**': 1 }); // Indexes all endpoint names dynamically
StatSchema.index({ 'daily.$**': 1 }); // Indexes all daily stats dynamically

const Stat = model('Stat', StatSchema);

export default Stat;
