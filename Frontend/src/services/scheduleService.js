import apiClient from '../config/axiosConfig';

// --- Schedule Generation ---
export const generateSchedule = async (generationParams) => {
  // generationParams = { promo_id, semester_id, teacher_assignments (optional) }
  try {
    const response = await apiClient.post('/api/schedule/generate/', generationParams);
    return response.data;
  } catch (error) {
    console.error('Generate Schedule API error:', error.response || error.message);
    throw error;
  }
};

// Function to fetch schedule entries with filters
export const getScheduleEntries = async (filters = {}) => {
  // filters can include promo_id, semester_id, section_id, teacher_id etc.
  try {
    const response = await apiClient.get('/schedule-entries/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Get Schedule Entries API error:', error.response || error.message);
    throw error;
  }
};

// Function to get schedule for a specific section
export const getSectionSchedule = async (sectionId) => {
  try {
    const response = await apiClient.get(`/api/schedule/section/${sectionId}/`);
    return response.data;
  } catch (error) {
    console.error('Get Section Schedule API error:', error.response || error.message);
    throw error;
  }
};

// Note: Teacher schedule is likely in teacherService.js 

// Function to trigger schedule generation
export const generateClassSchedule = async (promoId, semesterId) => {
  try {
    // The path matches the one added in Acadimic/urls.py
    const response = await apiClient.post('/generate-class-schedule/', { 
      promo_id: promoId, 
      semester_id: semesterId 
    });
    return response.data; // Should contain success message or error details
  } catch (error) {
    console.error('Generate Class Schedule API error:', error.response || error.message);
    // Rethrow the error so the component can catch it and display messages
    throw error; 
  }
};

// Placeholder for generating exam schedule (if separate)
export const generateExamSchedule = async (/* params */) => {
  // ... implementation ...
}; 