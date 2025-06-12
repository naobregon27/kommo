import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://kommo-p0ts.onrender.com',  // Updated to use the full server URL
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error('Error de autenticación:', error);
    }
    return Promise.reject(error);
  }
);

export default api; 

//