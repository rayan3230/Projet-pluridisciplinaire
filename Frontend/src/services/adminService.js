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

// Function to fetch locations
export const getLocations = async () => {
    try {
        const response = await apiClient.get('/locations/'); // Use the registered endpoint
        return response.data;
    } catch (error) {
        console.error('Error fetching locations:', error.response?.data || error.message);
        throw error; // Re-throw the error to be handled by the component
    }
};

// Function to fetch classrooms
export const getClassrooms = async () => {
    try {
        const response = await apiClient.get('/classrooms/');
        return response.data;
    } catch (error) {
        console.error('Error fetching classrooms:', error.response?.data || error.message);
        throw error;
    }
};

// Function to create a classroom
export const createClassroom = async (classroomData) => {
    try {
        const response = await apiClient.post('/classrooms/', classroomData);
        return response.data;
    } catch (error) {
        console.error('Error creating classroom:', error.response?.data || error.message);
        throw error;
    }
};

// Function to update a classroom
export const updateClassroom = async (id, classroomData) => {
    try {
        const response = await apiClient.put(`/classrooms/${id}/`, classroomData);
        return response.data;
    } catch (error) {
        console.error(`Error updating classroom ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// Function to delete a classroom
export const deleteClassroom = async (id) => {
    try {
        await apiClient.delete(`/classrooms/${id}/`);
    } catch (error) {
        console.error(`Error deleting classroom ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// Function to create a location
export const createLocation = async (locationData) => {
    try {
        const response = await apiClient.post('/locations/', locationData);
        return response.data;
    } catch (error) {
        console.error('Error creating location:', error.response?.data || error.message);
        throw error;
    }
};

// Function to update a location
export const updateLocation = async (id, locationData) => {
    try {
        const response = await apiClient.put(`/locations/${id}/`, locationData);
        return response.data;
    } catch (error) {
        console.error(`Error updating location ${id}:`, error.response?.data || error.message);
        throw error;
    }
};

// Function to delete a location
export const deleteLocation = async (id) => {
    try {
        await apiClient.delete(`/locations/${id}/`);
    } catch (error) {
        // Handle potential foreign key constraints (e.g., location used by classrooms)
        console.error(`Error deleting location ${id}:`, error.response?.data || error.message);
        if (error.response?.status === 400 || error.response?.status === 409) { // Example: Conflict/Bad Request due to FK
             throw new Error('Cannot delete location because it is currently assigned to one or more classrooms.');
        } else {
            throw error;
        }
    }
};

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