import { Schema, model, models } from 'mongoose';

const subTaskSchema = new Schema({
  amount: { type: Number, default: 0 },
  payment_id: { type: String, default: '' },
  guide: { type: String, default: '' },
  upload: { type: String, default: '' },
}, { _id: false });

const taskSchema = new Schema({
  status: { type: String, required: true },
  client_id: { type: String, required: true },
  accountant_id: { type: String, required: true },
  amount: { type: Number, required: true },
  period: { type: String, required: true },
  due_date: { type: String, required: true },
  what: { type: String, required: true },
  who: { type: String, required: true },
  payment_id: { type: String, default: '' },
  guide: { type: String, default: '' },
  upload: { type: String, default: '' },
  subTasks: [subTaskSchema],
}, { timestamps: true });

const Task = models.Task || model('Task', taskSchema);

export default Task;
