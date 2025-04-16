import apiClient from '../config/axiosConfig';

// Assuming teacher preferences are stored/retrieved via a dedicated endpoint
// This might involve a separate model or a field on the User model backend-side.

// --- Teacher Preferences ---
export const getTeacherPreferences = async (teacherId) => {
  // Backend needs an endpoint like /api/teachers/{teacher_id}/preferences/
  // This endpoint should return the IDs or full objects of the BaseModules the teacher prefers.
  try {
    const response = await apiClient.get(`/api/teachers/${teacherId}/preferences/`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return [];
    }
    throw error;
  }
};

export const updateTeacherPreferences = async (teacherId, baseModuleIds) => {
  // Backend needs an endpoint like PUT or POST /api/teachers/{teacher_id}/preferences/
  // The payload should likely be a list of BaseModule IDs.
  try {
    const response = await apiClient.put(`/api/teachers/${teacherId}/preferences/`, { base_module_ids: baseModuleIds });
    return response.data;
  } catch (error) {
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
    const response = await apiClient.get('/api/schedule-entries/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 