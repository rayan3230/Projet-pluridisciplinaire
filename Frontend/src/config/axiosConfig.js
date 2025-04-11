import axios from 'axios';

// Remove global API key placeholders
// let globalApiKey = null;
// export const setGlobalApiKey = (key) => { globalApiKey = key; };
// export const clearGlobalApiKey = () => { globalApiKey = null; };

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
  // Remove withCredentials as we are not using cookies
  // withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
  // Remove CSRF config as we are not using CSRF cookies
  // xsrfCookieName: 'csrftoken',
  // xsrfHeaderName: 'X-CSRFToken', 
});

// Remove the request interceptor adding X-API-Key
// apiClient.interceptors.request.use(config => {
//     const apiKey = globalApiKey; 
//     if (apiKey) {
//         config.headers['X-API-Key'] = apiKey;
//     }
//     return config;
// }, error => {
//     return Promise.reject(error);
// });

// apiClient.interceptors.response.use(response => {
//   // Handle successful responses
//   return response;
// }, error => {
//   // Handle errors globally (e.g., redirect on 401/403 if applicable)
//   console.error('Axios error:', error.response || error.message);
//   return Promise.reject(error);
// });

export default apiClient; 