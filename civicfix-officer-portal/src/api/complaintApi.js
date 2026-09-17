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
  updateStatus: (complaintId, status, comment = '') => {
    if (!status) {
      return Promise.reject(new Error('A valid status transition must be provided.'));
    }

    return apiClient.patch(`/complaints/${complaintId}/status`, {
      status,
      new_status: status,
      newStatus: status,
      comment: comment?.trim() || '',
    });
  },
};