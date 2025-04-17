import apiClient from '../config/axiosConfig';

// --- Semesters ---
export const getSemesters = async () => {
  try {
    const response = await apiClient.get('/semesters/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSemester = async (id, semesterData) => {
  try {
    // Use PATCH for partial updates (like changing only dates)
    const response = await apiClient.patch(`/semesters/${id}/`, semesterData);
    return response.data;
  } catch (error) {
    // Log the detailed error response from the backend if available
    if (error.response && error.response.data) {
        console.error('Update Semester API error data:', error.response.data);
    } else {
        console.error('Update Semester API error:', error.response || error.message);
    }
    throw error;
  }
};

// --- Exams (assuming managed via a separate endpoint) ---
export const getExams = async (semesterId = null, moduleId = null) => {
  try {
    const params = {};
    if (semesterId) params.semester_id = semesterId;
    if (moduleId) params.module_id = moduleId;
    const response = await apiClient.get('/exams/', { params });
    return response.data;
  } catch (error) {
    console.error('Get Exams API error:', error.response || error.message);
    throw error;
  }
};

export const createExam = async (examData) => {
  // examData = { name, semester_id, module_id, exam_date, duration_minutes }
  try {
    const response = await apiClient.post('/exams/', examData);
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