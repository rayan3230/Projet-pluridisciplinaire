import apiClient from '../config/axiosConfig';

// --- Exams ---
export const getExams = async (semesterId = null, promoId = null, moduleId = null) => {
  try {
    const params = {};
    if (semesterId) params.semester_id = semesterId;
    if (promoId) params.promo_id = promoId;
    if (moduleId) params.module_id = moduleId;
    const response = await apiClient.get('/exams/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createExam = async (examData) => {
  // examData = { name, semester_id, module_id, exam_date, duration_minutes }
  try {
    const response = await apiClient.post('/exams/', examData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateExam = async (id, examData) => {
  try {
    const response = await apiClient.put(`/exams/${id}/`, examData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteExam = async (id) => {
  try {
    await apiClient.delete(`/exams/${id}/`);
  } catch (error) {
    throw error;
  }
};

// --- Exam Periods ---
export const getExamPeriods = async (semesterId) => {
  try {
    const response = await apiClient.get('/exam-periods/', { params: { semester_id: semesterId } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createExamPeriod = async (periodData) => {
  // periodData = { semester_id, start_date, end_date }
  try {
    const response = await apiClient.post('/exam-periods/', periodData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Exam Schedule Generation ---
export const generateExamSchedule = async (promoId, semesterId) => {
  try {
    const response = await apiClient.post('/generate-exam-schedule/', { promo_id: promoId, semester_id: semesterId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const generateAllPromosExamSchedule = async (semesterId) => {
  try {
    const response = await apiClient.post('/generate-all-promos-exam-schedule/', { semester_id: semesterId });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 