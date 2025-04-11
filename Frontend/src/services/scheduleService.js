import apiClient from '../config/axiosConfig';

// --- Schedule Generation ---
export const generateSchedule = async (generationParams) => {
  // generationParams = { promo_id, semester_id, teacher_assignments (optional, TBD) }
  try {
    // This needs a dedicated backend view, not just a standard ViewSet POST
    const response = await apiClient.post('/api/generate-schedule/', generationParams); 
    // Response might include the generated schedule entries or just a success/task ID
    return response.data;
  } catch (error) {
    console.error('Generate Schedule API error:', error.response || error.message);
    throw error;
  }
};

// Function to get existing schedule entries (uses standard ViewSet endpoint)
export const getScheduleEntries = async (filters = {}) => {
  // filters: { section_id, teacher_id, semester_id, promo_id, etc. }
  try {
    const response = await apiClient.get('/api/schedule-entries/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Get Schedule Entries API error:', error.response || error.message);
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