const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    datasets: '/api/v1/datasets',
    health: '/api/v1/health',
    chatbot: '/api/v1/chatbot',
    auth: '/api/v1/auth'
  }
};

export default API_BASE_URL;