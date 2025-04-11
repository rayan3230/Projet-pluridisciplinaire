import apiClient from '../config/axiosConfig';

// --- User Management ---
export const createUser = async (userData) => {
  // userData expected: { full_name, personnel_email, is_admin?, is_teacher? }
  // Backend will generate scope_email and temp_password
  try {
    const response = await apiClient.post('/users/', userData); // Path relative to /api/
    return response.data;
  } catch (error) {
    console.error('Create User API error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUsers = async (params = {}) => {
    // params could include role=admin, role=teacher etc.
    try {
        const response = await apiClient.get('/users/', { params }); // Path relative to /api/
        return response.data;
    } catch(error) {
        console.error('Get Users API error:', error.response?.data || error.message);
        throw error;
    }
};

export const getTeachers = async () => {
    // Convenience function to get only users flagged as teachers
    return getUsers({ is_teacher: 'true' });
};

export const updateUser = async (userId, userData) => {
    try {
        // Assuming a PUT request to /api/users/{userId}/
        const response = await apiClient.put(`/users/${userId}/`, userData);
        return response.data;
    } catch(error) {
        console.error(`Update User ${userId} API error:`, error.response?.data || error.message);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        // Assuming a DELETE request to /api/users/{userId}/
        await apiClient.delete(`/users/${userId}/`);
    } catch(error) {
        console.error(`Delete User ${userId} API error:`, error.response?.data || error.message);
        throw error;
    }
};

// TODO: Add getUser(id), updateUser(id, data), deleteUser(id)

// --- Teacher Module Assignment ---
export const getAssignments = async (filters = {}) => {
    // filters could be { teacher_id, promo_id, module_id }
    try {
        const response = await apiClient.get('/assignments/', { params: filters }); // Path relative to /api/
        return response.data;
    } catch (error) {
        console.error('Get Assignments API error:', error.response?.data || error.message);
        throw error;
    }
};

export const createAssignment = async (assignmentData) => {
  // Expecting { teacher_id, module_id, promo_id }
  try {
    const response = await apiClient.post('/assignments/', assignmentData); // Path relative to /api/
    return response.data;
  } catch (error) {
    console.error('Create Assignment API error:', error.response?.data || error.message);
    throw error;
  }
};

// TODO: Implement deleteAssignment if needed


// Placeholder/Mock section removed
// // --- Teacher Assignment (Placeholder) ---
// export const assignTeacherToModule = async (assignmentData) => {
//   // assignmentData structure TBD (e.g., { teacher_id, module_id, promo_id, semester_id })
//   try {
//     const response = await apiClient.post('/admin/assignments/', assignmentData);
//     return response.data;
//   } catch (error) {
//     console.error('Assign Teacher API error:', error.response || error.message);
//     throw error;
//   }
// }; 