import { Schema, model, models } from 'mongoose';

const filesSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  client_id: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

export default models.File || model('File', filesSchema);