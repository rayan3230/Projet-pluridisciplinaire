import apiClient from '../config/axiosConfig';
import axios from 'axios';

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

export const exportScheduleToPDF = async (promoId, semesterId) => {
    try {
        // First get the promo details
        const promoResponse = await apiClient.get(`/promos/${promoId}/`);
        const promo = promoResponse.data;
        
        const response = await apiClient.get('/export-schedule-pdf/', {
            params: { promo_id: promoId, semester_id: semesterId },
            responseType: 'blob'
        });
        
        // Create a blob from the response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        
        // Create filename with promo details
        const filename = `Schedule_${promo.speciality.name}_${promo.year_start}-${promo.year_end}.pdf`;
        
        // Create download link and trigger download
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
        console.error('Export Schedule to PDF API error:', error);
        throw error;
    }
};

export const exportScheduleToExcel = async (promoId, semesterId) => {
    try {
        // First get the promo details
        const promoResponse = await apiClient.get(`/promos/${promoId}/`);
        const promo = promoResponse.data;
        
        const response = await apiClient.get('/export-schedule-excel/', {
            params: { promo_id: promoId, semester_id: semesterId },
            responseType: 'blob'
        });
        
        // Create a blob from the response
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Create filename with promo details
        const filename = `Schedule_${promo.speciality.name}_${promo.year_start}-${promo.year_end}.xlsx`;
        
        // Create download link and trigger download
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
        console.error('Export Schedule to Excel API error:', error);
        throw error;
    }
};

export const exportTeacherScheduleToPDF = async (teacherId, semesterId) => {
    try {
        // First get the teacher details
        const teacherResponse = await apiClient.get(`/users/${teacherId}/`);
        const teacher = teacherResponse.data;
        
        const response = await apiClient.get('/export-schedule-pdf/', {
            params: { teacher_id: teacherId, semester_id: semesterId },
            responseType: 'blob'
        });
        
        // Create a blob from the response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        
        // Create filename with teacher details
        const filename = `Schedule_${teacher.full_name}_${semesterId}.pdf`;
        
        // Create download link and trigger download
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
        console.error('Export Teacher Schedule to PDF API error:', error);
        throw error;
    }
};

export const exportTeacherScheduleToExcel = async (teacherId, semesterId) => {
    try {
        // First get the teacher details
        const teacherResponse = await apiClient.get(`/users/${teacherId}/`);
        const teacher = teacherResponse.data;
        
        const response = await apiClient.get('/export-schedule-excel/', {
            params: { teacher_id: teacherId, semester_id: semesterId },
            responseType: 'blob'
        });
        
        // Create a blob from the response
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Create filename with teacher details
        const filename = `Schedule_${teacher.full_name}_${semesterId}.xlsx`;
        
        // Create download link and trigger download
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
        console.error('Export Teacher Schedule to Excel API error:', error);
        throw error;
    }
}; 