import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: '/api', // This will be proxied to http://localhost:3001/api
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can add authentication headers here if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// SMS Service
export const smsService = {
  // Send SMS
  async sendSMS(phoneNumber, message) {
    try {
      const response = await apiClient.post('/sms/send', {
        phoneNumber,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  },

  // Get SMS history
  async getSMSHistory() {
    try {
      const response = await apiClient.get('/sms/history');
      return response.data;
    } catch (error) {
      console.error('Error getting SMS history:', error);
      throw error;
    }
  },

  // Get SMS status
  async getSMSStatus(messageId) {
    try {
      const response = await apiClient.get(`/sms/status/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting SMS status:', error);
      throw error;
    }
  }
};

// Command Service
export const commandService = {
  // Send traffic light command
  async sendTrafficCommand(command) {
    try {
      const response = await apiClient.post('/command/traffic', command);
      return response.data;
    } catch (error) {
      console.error('Error sending traffic command:', error);
      throw error;
    }
  },

  // Get command history
  async getCommandHistory() {
    try {
      const response = await apiClient.get('/command/history');
      return response.data;
    } catch (error) {
      console.error('Error getting command history:', error);
      throw error;
    }
  },

  // Get system status
  async getSystemStatus() {
    try {
      const response = await apiClient.get('/command/status');
      return response.data;
    } catch (error) {
      console.error('Error getting system status:', error);
      throw error;
    }
  }
};

// Health check
export const healthService = {
  async checkBackendHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Error checking backend health:', error);
      throw error;
    }
  }
};

// Test connection
export const testConnection = async () => {
  try {
    console.log('🔗 Attempting to connect to backend...');
    console.log('📍 Using baseURL:', apiClient.defaults.baseURL);
    
    const health = await healthService.checkBackendHealth();
    console.log('✅ Backend connection successful:', health);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return false;
  }
};

// Traffic State Service
export const trafficStateService = {
  async getTrafficState() {
    try {
      const response = await apiClient.get('/traffic/state');
      return response.data;
    } catch (error) {
      console.error('Error fetching traffic state:', error);
      throw error;
    }
  },
  async overrideTrafficState(override) {
    try {
      const response = await apiClient.post('/traffic/override', override);
      return response.data;
    } catch (error) {
      console.error('Error overriding traffic state:', error);
      throw error;
    }
  }
};

export default apiClient; 