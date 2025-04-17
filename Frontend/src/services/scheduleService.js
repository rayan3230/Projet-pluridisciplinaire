import apiClient from '../config/axiosConfig';
import axios from 'axios';

// --- Schedule Generation ---
export const generateSchedule = async (generationParams) => {
  // generationParams = { promo_id, semester_id, teacher_assignments (optional) }
  try {
    const response = await apiClient.post('/api/schedule/generate/', generationParams);
    return response.data;
  } catch (error) {
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
    throw error;
  }
};

// Function to get schedule for a specific section
export const getSectionSchedule = async (sectionId) => {
  try {
    const response = await apiClient.get(`/api/schedule/section/${sectionId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Note: Teacher schedule is likely in teacherService.js 

// Function to trigger schedule generation
export const generateClassSchedule = async (promoId, semesterId, teacherIds, overwrite = false) => {
  try {
    const response = await apiClient.post('/generate-class-schedule/', {
      promo_id: promoId,
      semester_id: semesterId,
      teacher_ids: teacherIds,
      overwrite: overwrite
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Placeholder for generating exam schedule (if separate)
export const generateExamSchedule = async () => {
  // Implementation pending
};

export const exportScheduleToPDF = async (promoId, semesterId) => {
  try {
    const promoResponse = await apiClient.get(`/promos/${promoId}/`);
    const promo = promoResponse.data;
    
    const response = await apiClient.get('/export-schedule-pdf/', {
      params: { promo_id: promoId, semester_id: semesterId },
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const filename = `Schedule_${promo.speciality.name}_${promo.year_start}-${promo.year_end}.pdf`;
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportScheduleToExcel = async (promoId, semesterId) => {
  try {
    const promoResponse = await apiClient.get(`/promos/${promoId}/`);
    const promo = promoResponse.data;
    
    const response = await apiClient.get('/export-schedule-excel/', {
      params: { promo_id: promoId, semester_id: semesterId },
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `Schedule_${promo.speciality.name}_${promo.year_start}-${promo.year_end}.xlsx`;
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportTeacherScheduleToPDF = async (teacherId, semesterId) => {
  try {
    const teacherResponse = await apiClient.get(`/users/${teacherId}/`);
    const teacher = teacherResponse.data;
    
    const response = await apiClient.get('/export-schedule-pdf/', {
      params: { teacher_id: teacherId, semester_id: semesterId },
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const filename = `Schedule_${teacher.full_name}_${semesterId}.pdf`;
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const exportTeacherScheduleToExcel = async (teacherId, semesterId) => {
  try {
    const teacherResponse = await apiClient.get(`/users/${teacherId}/`);
    const teacher = teacherResponse.data;
    
    const response = await apiClient.get('/export-schedule-excel/', {
      params: { teacher_id: teacherId, semester_id: semesterId },
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `Schedule_${teacher.full_name}_${semesterId}.xlsx`;
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch Academic Years
export const getAcademicYears = async () => {
  try {
    const response = await apiClient.get('/academic-years/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch Semesters for a given Academic Year
export const getSemestersByYear = async (yearId) => {
  try {
    const response = await apiClient.get(`/academic-years/${yearId}/semesters/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch Promos (potentially filter by academic year)
export const getPromos = async (academicYearId = null) => {
  try {
    let url = '/promos/';
    if (academicYearId) {
      url += `?academic_year=${academicYearId}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fetch Compatible Teachers for Promo and Semester
export const getCompatibleTeachers = async (promoId, semesterId) => {
  if (!promoId || !semesterId) {
    return [];
  }
  try {
    const response = await apiClient.get('/compatible-teachers/', {
      params: { promo_id: promoId, semester_id: semesterId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 