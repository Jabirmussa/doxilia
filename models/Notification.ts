import { Schema, model, models } from "mongoose";

const notificationSchema = new Schema({
  role: { type: String, enum: ["admin", "client", "accountant"], required: true },
  user_id: { type: Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
}, { timestamps: true });

export default models.Notification || model("Notification", notificationSchema);
