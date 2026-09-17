import client from "./client";

export const getNotifications = async () => {
  const res = await client.get("/notifications");
  return res.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const res = await client.patch(`/notifications/${notificationId}/read`);
  return res.data;
};