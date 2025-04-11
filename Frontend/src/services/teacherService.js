import apiClient from '../config/axiosConfig';

// --- Teacher Preferences ---
export const getTeacherPreferences = async (teacherId) => {
  // Assuming teacherId is known (e.g., from auth context)
  // Backend needs an endpoint like /api/teachers/{teacher_id}/preferences/
  try {
    // const response = await apiClient.get(`/teachers/${teacherId}/preferences/`);
    // return response.data; // Should return list of base module IDs or objects
    console.log('Mock fetch preferences for teacher:', teacherId);
    return [1, 3]; // Mock response: Prefers modules with ID 1 and 3
  } catch (error) {
    console.error('Get Teacher Preferences API error:', error.response || error.message);
    throw error;
  }
};

export const updateTeacherPreferences = async (teacherId, moduleIds) => {
  // moduleIds is an array of preferred base module IDs
  try {
    const response = await apiClient.post(`/teachers/preferences/`, { module_ids: moduleIds }); // Send IDs in body
    // Backend needs logic to associate these base modules with the teacher
    return response.data;
  } catch (error) {
    console.error('Update Teacher Preferences API error:', error.response || error.message);
    throw error;
  }
};

// --- Teacher Schedule ---
export const getTeacherSchedule = async (teacherId) => {
  try {
    const response = await apiClient.get(`/teachers/${teacherId}/schedule/`);
    return response.data; // Schedule data structure TBD
  } catch (error) {
    console.error(`Get Teacher ${teacherId} Schedule API error:`, error.response || error.message);
    throw error;
  }
}; 