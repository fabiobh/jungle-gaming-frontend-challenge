import axios from 'axios';
import { scenarioManager } from '@/mocks/scenarios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add auth token and simulate latency
apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('__jungle_auth_token__');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const scenario = scenarioManager.getConfig();
  if (scenario.latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, scenario.latencyMs));
  }

  return config;
});

// Response interceptor: handle 401 expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clean up token if session expired
      localStorage.removeItem('__jungle_auth_token__');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(error);
  }
);
