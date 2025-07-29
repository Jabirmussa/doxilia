/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcrypt';

const accountantSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  nuit: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });


accountantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


accountantSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default models.Accountant || model('Accountant', accountantSchema);
