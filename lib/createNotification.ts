import Notification from "@/models/Notification";
import { connectDB } from "@/lib/mongodb";

export async function createNotification(role: string, user_id: string, message: string) {
  await connectDB();
  await Notification.create({ role, user_id, message });
}
