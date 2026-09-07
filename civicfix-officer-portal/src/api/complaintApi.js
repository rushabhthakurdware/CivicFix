import apiClient from './apiClient';

export const complaintApi = {
  // Fetch list with optional severity and status filters
  getOfficerComplaints: (params = {}) =>
    apiClient.get('/complaints/officer/all', { params }),

  // Fetch individual report details
  getComplaintDetail: (complaintId) =>
    apiClient.get(`/complaints/officer/${complaintId}`),

  // Fetch chronological status history for the audit timeline
  getStatusHistory: (complaintId) =>
    apiClient.get(`/complaints/${complaintId}/status-history`),

  // Update status (e.g., UNDER_REVIEW -> IN_PROGRESS -> RESOLVED)
  updateStatus: (complaintId, status, comment = '') =>
    apiClient.patch(`/complaints/${complaintId}/status`, { status, comment }),
};