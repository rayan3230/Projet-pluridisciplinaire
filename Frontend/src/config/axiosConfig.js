import axios from 'axios';

// Helper function to get a cookie by name
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Determine the base URL for the Django backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add CSRF token to requests automatically
apiClient.interceptors.request.use(config => {
  // Only add CSRF token for methods that require it
  if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
}, error => {
  // Handle request error here
  return Promise.reject(error);
});

export default apiClient; 