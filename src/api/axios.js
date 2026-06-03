import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem('triage_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed && parsed.token) {
          config.headers['Authorization'] = `Bearer ${parsed.token}`;
        }
      } catch (err) {
        console.error('Error parsing triage session token:', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthenticated and redirect to Login
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request! Clearing session and logging out...');
      localStorage.removeItem('triage_session');
      
      // We can reload the page so the App router resets and routes to landing/login
      // This is a robust way to sync SPA state across components
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
