import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export const getHealth = async () => {
  const res = await api.get('/health');
  return res.data;
};

export const getDocuments = async () => {
  const res = await api.get('/documents');
  return res.data;
};

export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
};

export const askQuestion = async (question, documentId = null, topK = 4) => {
  const res = await api.post('/ask', {
    question,
    document_id: documentId,
    top_k: topK,
  });
  return res.data;
};

export const getChatHistory = async (documentId = null) => {
  const res = await api.get('/chat/history', {
    params: documentId ? { document_id: documentId } : {},
  });
  return res.data;
};

export const clearChatHistory = async (documentId = null) => {
  const res = await api.delete('/chat/history', {
    params: documentId ? { document_id: documentId } : {},
  });
  return res.data;
};

export const updateApiKey = async (apiKey) => {
  const res = await api.post('/config/key', {
    api_key: apiKey,
  });
  return res.data;
};

export default api;
