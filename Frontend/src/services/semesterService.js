import apiClient from '../config/axiosConfig';

// --- Semesters ---
export const getSemesters = async () => {
  try {
    const response = await apiClient.get('/semesters/');
    return response.data;
  } catch (error) {
    console.error('Get Semesters API error:', error.response || error.message);
    throw error;
  }
};

export const createSemester = async (semesterData) => {
  // semesterData = { name, start_date, end_date }
  try {
    const response = await apiClient.post('/semesters/', semesterData);
    return response.data;
  } catch (error) {
    console.error('Create Semester API error:', error.response || error.message);
    throw error;
  }
};
// Add getSemester, updateSemester, deleteSemester as needed

// --- Semester Module Assignment ---
export const assignModuleToSemester = async (semesterId, moduleId) => {
  try {
    // Endpoint might be specific, e.g., POST /semesters/{semesterId}/modules/
    const response = await apiClient.post(`/semesters/${semesterId}/modules/`, { module_id: moduleId });
    return response.data;
  } catch (error) {
    console.error(`Assign Module to Semester ${semesterId} API error:`, error.response || error.message);
    throw error;
  }
};

// --- Exam Periods ---
export const defineExamPeriod = async (semesterId, examData) => {
  // examData structure TBD (e.g., { start_date, end_date, description })
  try {
    // Endpoint might be specific, e.g., POST /semesters/{semesterId}/exams/
    const response = await apiClient.post(`/semesters/${semesterId}/exams/`, examData);
    return response.data;
  } catch (error) {
    console.error(`Define Exam Period for Semester ${semesterId} API error:`, error.response || error.message);
    throw error;
  }
}; 