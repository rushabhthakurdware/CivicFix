export const STATUS_COLORS = {
  SUBMITTED: "#6b7280",
  UNDER_REVIEW: "#d97706",
  IN_PROGRESS: "#2563eb",
  RESOLVED: "#16a34a",
  CLOSED: "#374151",
  REJECTED: "#dc2626",
};

export const SEVERITY_COLORS = {
  LOW: "#16a34a",
  MEDIUM: "#d97706",
  HIGH: "#dc2626",
};

export const formatStatus = (status) =>
  status ? status.replace("_", " ") : "";