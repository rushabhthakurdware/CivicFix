import client from "./client";

export const createComplaint = async (formData) => {
  const res = await client.post("/complaints", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getMyComplaints = async () => {
  const res = await client.get("/complaints/my");
  return res.data;
};