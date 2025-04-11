import apiClient from '../config/axiosConfig';

// --- User Management ---
export const createUser = async (userData) => {
  // userData expected: { full_name, personnel_email, is_admin?, is_teacher? }
  // Backend will generate scope_email and temp_password
  try {
    const response = await apiClient.post('/api/users/create/', userData); // Path matches users.urls
    return response.data;
  } catch (error) {
    console.error('Create User API error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUsers = async (params = {}) => {
    // params could include role=admin, role=teacher etc.
    try {
        const response = await apiClient.get('/api/users/', { params }); // Path matches users.urls
        return response.data;
    } catch(error) {
        console.error('Get Users API error:', error.response?.data || error.message);
        throw error;
    }
};

export const getTeachers = async () => {
    // Convenience function to get only teachers
    return getUsers({ is_teacher: 'true' });
};

// TODO: Add getUser(id), updateUser(id, data), deleteUser(id)

// --- Teacher Module Assignment ---
export const getAssignments = async (filters = {}) => {
    // filters could be { teacher_id, promo_id, module_id }
    try {
        const response = await apiClient.get('/api/assignments/', { params: filters }); // Path matches Acadimic.urls
        return response.data;
    } catch (error) {
        console.error('Get Assignments API error:', error.response?.data || error.message);
        throw error;
    }
};

export const createAssignment = async (assignmentData) => {
  // Expecting { teacher_id, module_id, promo_id }
  try {
    const response = await apiClient.post('/api/assignments/', assignmentData); // Path matches Acadimic.urls
    return response.data;
  } catch (error) {
    console.error('Create Assignment API error:', error.response?.data || error.message);
    throw error;
  }
};

// TODO: Add deleteAssignment(id)


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