import apiClient from '../config/axiosConfig';

// --- Semesters ---
export const getSemesters = async () => {
  try {
    const response = await apiClient.get('/api/semesters/');
    return response.data;
  } catch (error) {
    console.error('Get Semesters API error:', error.response || error.message);
    throw error;
  }
};

export const createSemester = async (semesterData) => {
  // semesterData = { name, start_date, end_date }
  try {
    const response = await apiClient.post('/api/semesters/', semesterData);
    return response.data;
  } catch (error) {
    console.error('Create Semester API error:', error.response || error.message);
    throw error;
  }
};
// TODO: Add getSemester(id), updateSemester(id, data), deleteSemester(id)

// --- Exams (assuming managed via a separate endpoint) ---
export const getExams = async (semesterId = null, moduleId = null) => {
  try {
    const params = {};
    if (semesterId) params.semester_id = semesterId;
    if (moduleId) params.module_id = moduleId;
    const response = await apiClient.get('/api/exams/', { params });
    return response.data;
  } catch (error) {
    console.error('Get Exams API error:', error.response || error.message);
    throw error;
  }
};

export const createExam = async (examData) => {
  // examData = { name, semester_id, module_id, exam_date, duration_minutes }
  try {
    const response = await apiClient.post('/api/exams/', examData);
    return response.data;
  } catch (error) {
    console.error('Create Exam API error:', error.response || error.message);
    throw error;
  }
};
// TODO: Add getExam(id), updateExam(id, data), deleteExam(id)


// --- Functions below might need specific backend endpoints or adjustments ---

// --- Semester Module Assignment (If using a separate relation/endpoint) ---
// export const assignModuleToSemester = async (semesterId, moduleId) => {
//   try {
//     // Endpoint might be specific, e.g., POST /api/semesters/{semesterId}/modules/
//     const response = await apiClient.post(`/api/semesters/${semesterId}/modules/`, { module_id: moduleId });
//     return response.data;
//   } catch (error) {
//     console.error(`Assign Module to Semester ${semesterId} API error:`, error.response || error.message);
//     throw error;
//   }
// };

// --- Exam Periods (If defining ranges separately from individual Exams) ---
// export const defineExamPeriod = async (semesterId, examData) => {
//   // examData structure TBD (e.g., { start_date, end_date, description })
//   try {
//     // Endpoint might be specific, e.g., POST /api/semesters/{semesterId}/exam-periods/
//     const response = await apiClient.post(`/api/semesters/${semesterId}/exam-periods/`, examData);
//     return response.data;
//   } catch (error) {
//     console.error(`Define Exam Period for Semester ${semesterId} API error:`, error.response || error.message);
//     throw error;
//   }
// }; 