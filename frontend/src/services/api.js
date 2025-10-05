import API_BASE_URL from '../config/api.js';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/api/health');
  }

  // Get datasets
  async getDatasets() {
    return this.request('/api/v1/datasets');
  }

  // Chatbot query
  async sendChatMessage(message, sessionId) {
    return this.request('/api/v1/chatbot/query', {
      method: 'POST',
      body: JSON.stringify({ message, sessionId }),
    });
  }
}

export default new ApiService();