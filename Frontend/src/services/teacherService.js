import apiClient from '../config/axiosConfig';

// Assuming teacher preferences are stored/retrieved via a dedicated endpoint
// This might involve a separate model or a field on the User model backend-side.

// --- Teacher Preferences ---
export const getTeacherPreferences = async (teacherId) => {
  // Backend needs an endpoint like /api/teachers/{teacher_id}/preferences/
  // This endpoint should return the IDs or full objects of the BaseModules the teacher prefers.
  try {
    const response = await apiClient.get(`/api/teachers/${teacherId}/preferences/`); // Updated path prefix
    return response.data; // Expecting list of BaseModule IDs or objects
    // console.log('Mock fetch preferences for teacher:', teacherId);
    // return [1, 3]; // Mock response
  } catch (error) {
    console.error('Get Teacher Preferences API error:', error.response || error.message);
    // If 404, might mean no preferences set yet, return empty array?
    if (error.response && error.response.status === 404) {
        return []; // No preferences found is not necessarily an error
    }
    throw error;
  }
};

export const updateTeacherPreferences = async (teacherId, baseModuleIds) => {
  // Backend needs an endpoint like PUT or POST /api/teachers/{teacher_id}/preferences/
  // The payload should likely be a list of BaseModule IDs.
  try {
    const response = await apiClient.put(`/api/teachers/${teacherId}/preferences/`, { base_module_ids: baseModuleIds }); // Updated path prefix
    return response.data;
    // console.log(`Updated preferences for teacher ${teacherId} (mock): `, baseModuleIds);
    // return { success: true }; // Mock response
  } catch (error) {
    console.error('Update Teacher Preferences API error:', error.response || error.message);
    throw error;
  }
};

// --- Teacher Schedule (Read-only for teacher view) ---
export const getTeacherSchedule = async (teacherId, semesterId = null) => {
    // Uses the main ScheduleEntry endpoint but filtered by teacher
  try {
    const params = { teacher_id: teacherId };
    if (semesterId) {
      params.semester_id = semesterId;
    }
    const response = await apiClient.get('/api/schedule-entries/', { params }); // Updated path
    return response.data;
  } catch (error) {
    console.error('Get Teacher Schedule API error:', error.response || error.message);
    throw error;
  }
}; 