/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, model, models } from 'mongoose';

const taskSchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: ['UPCOMING', 'CHECKING', 'OPEN', 'CLOSE'],
    default: 'UPCOMING',
  },
  client_id: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  accountant_id: {
    type: Schema.Types.ObjectId,
    ref: 'Accountant',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  due_date: {
    type: String,
    required: true,
  },
  what: {
    type: String,
    required: true,
  },
  who: {
    type: String,
    required: true,
  },
  payment_id: {
    type: String,
  },
  guide: {
    type: String,
  },
  upload: {
    type: String,
  },
}, { timestamps: true });

export default models.Task || model('Task', taskSchema);