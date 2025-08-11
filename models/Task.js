/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, model, models } from 'mongoose';
import { type } from 'os';

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
    enum: ["INSS", "IVA", "IRPC", "IRPS", "MULTA"],
    default: "INSS",
    required: true,
  },
  payment_id: {
    type: String,
  },
  guide: {
    type: String,
  },
  subTasks: [
    {
      amount: Number,
      payment_id: String,
      guide: String,
      // due_date: String,
      // period: String,
      // what: String
    }
  ],
  upload: {
    type: String,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

export default models.Task || model('Task', taskSchema);