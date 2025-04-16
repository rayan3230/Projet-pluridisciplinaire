import apiClient from '../config/axiosConfig';

export const loginUser = async (credentials) => {
  // credentials = { scope_email, password }
  try {
    const response = await apiClient.post('/auth/login/', credentials);
    // TODO: Handle response - check for temporary password flag?
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  // passwordData = { current_password, new_password }
  try {
    const response = await apiClient.post('/auth/change-password/', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add other auth-related API calls if needed (e.g., logout, refresh token - though tokens are disallowed) 