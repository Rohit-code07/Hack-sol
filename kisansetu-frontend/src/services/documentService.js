import { apiClient } from '../api/axiosClient';

function getActiveFarmerId() {
  try {
    const raw = localStorage.getItem('ks_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.farmerId) return parsed.farmerId;
      if (parsed.id) return parsed.id;
    }
  } catch (e) {}
  return null;
}

/**
 * Upload and analyze a document image or PDF.
 * @param {File} file - Image or PDF file
 * @param {string} [language='hi'] - User's chosen language ('hi' or 'en')
 * @param {string} [farmerId] - Optional farmer ID
 * @param {function} [onProgress] - Optional upload progress callback (0-100)
 */
export async function uploadAndAnalyzeDocument(file, language = 'hi', farmerId = null, onProgress = null) {
  const activeFarmerId = farmerId || getActiveFarmerId();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);
  if (activeFarmerId) {
    formData.append('farmerId', activeFarmerId);
  }

  const response = await apiClient.post('/documents/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 90000, // 90 seconds for multimodal AI vision analysis
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
}

/**
 * Fetch all analyzed documents for a farmer.
 * @param {string} [farmerId] - Optional farmer ID
 */
export async function getFarmerDocuments(farmerId = null) {
  const activeFarmerId = farmerId || getActiveFarmerId();
  const params = activeFarmerId ? { farmerId: activeFarmerId } : {};
  const response = await apiClient.get('/documents', { params });
  return response.data;
}

/**
 * Fetch details and analysis result for a specific document.
 * @param {string} documentId
 */
export async function getDocumentDetails(documentId) {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response.data;
}

/**
 * Ask a follow-up question about an analyzed document.
 * @param {string} documentId
 * @param {string} question
 * @param {string} [language='hi']
 */
export async function askDocumentQuestion(documentId, question, language = 'hi') {
  const response = await apiClient.post(`/documents/${documentId}/ask`, {
    question,
    language,
  });
  return response.data;
}

/**
 * Delete a document and its analysis result.
 * @param {string} documentId
 */
export async function deleteDocument(documentId) {
  const response = await apiClient.delete(`/documents/${documentId}`);
  return response.data;
}
