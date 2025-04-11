import apiClient from '../config/axiosConfig';

// --- User Management ---
export const createUser = async (userData) => {
  // userData = { full_name, personnel_email, is_teacher, is_admin }
  try {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  } catch (error) {
    console.error('Create User API error:', error.response || error.message);
    throw error;
  }
};

export const getUsers = async () => {
  try {
    const response = await apiClient.get('/users/');
    return response.data;
  } catch (error) {
    console.error('Get Users API error:', error.response || error.message);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error(`Get User ${userId} API error:`, error.response || error.message);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    console.error(`Update User ${userId} API error:`, error.response || error.message);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/${userId}/`);
    return response.data; // Or just status
  } catch (error) {
    console.error(`Delete User ${userId} API error:`, error.response || error.message);
    throw error;
  }
};

// --- Teacher Assignment (Placeholder) ---
export const assignTeacherToModule = async (assignmentData) => {
  // assignmentData structure TBD (e.g., { teacher_id, module_id, promo_id, semester_id })
  try {
    const response = await apiClient.post('/admin/assignments/', assignmentData);
    return response.data;
  } catch (error) {
    console.error('Assign Teacher API error:', error.response || error.message);
    throw error;
  }
};

// Helper potentially needed for assignment UI
export const getTeachers = async () => {
    try {
      const response = await apiClient.get('/users/', { params: { is_teacher: true } });
      return response.data;
    } catch (error) {
      console.error('Get Teachers API error:', error.response || error.message);
      throw error;
    }
  }; 