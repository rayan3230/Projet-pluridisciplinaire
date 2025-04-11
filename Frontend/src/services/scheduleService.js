import apiClient from '../config/axiosConfig';

// --- Schedule Generation ---
export const generateSchedule = async (generationParams) => {
  // generationParams = { promo_id, semester_id, teacher_assignments }
  try {
    const response = await apiClient.post('/schedule/generate/', generationParams);
    // Response might be immediate success/failure or job ID if async
    // May also return the generated schedule directly if synchronous and fast
    return response.data;
  } catch (error) {
    console.error('Generate Schedule API error:', error.response || error.message);
    throw error;
  }
};

// --- Schedule Viewing ---
export const getSectionSchedule = async (sectionId) => {
  try {
    const response = await apiClient.get(`/schedule/section/${sectionId}/`);
    return response.data; // Expected format: array of schedule events
  } catch (error) {
    console.error(`Get Section ${sectionId} Schedule API error:`, error.response || error.message);
    throw error;
  }
};

// Note: Teacher schedule is likely in teacherService.js 