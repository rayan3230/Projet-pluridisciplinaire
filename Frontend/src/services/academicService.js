import apiClient from '../config/axiosConfig';
import axios from 'axios';

// --- Specialities ---
export const getSpecialities = async () => {
  try {
    const response = await apiClient.get('/specialities/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSpeciality = async (specialityData) => {
  try {
    const response = await apiClient.post('/specialities/', specialityData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSpeciality = async (id, specialityData) => {
  try {
    const response = await apiClient.put(`/specialities/${id}/`, specialityData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSpeciality = async (id) => {
  try {
    await apiClient.delete(`/specialities/${id}/`);
  } catch (error) {
    throw error;
  }
};

// --- Promos ---
export const getPromos = async (specialityId = null) => {
  try {
    const params = specialityId ? { speciality_id: specialityId } : {};
    const response = await apiClient.get('/promos/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPromo = async (promoData) => {
  try {
    const response = await apiClient.post('/promos/', promoData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data || error.message;
    throw new Error(errorMessage);
  }
};

export const updatePromo = async (id, promoData) => {
  try {
    const response = await apiClient.put(`/promos/${id}/`, promoData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePromo = async (id) => {
  try {
    await apiClient.delete(`/promos/${id}/`);
  } catch (error) {
    throw error;
  }
};

export const getPromoById = async (id) => {
  try {
    const response = await apiClient.get(`/promos/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Sections ---
export const getSections = async (filters = {}) => {
  try {
    const response = await apiClient.get('/sections/', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSection = async (sectionData) => {
  try {
    const response = await apiClient.post('/sections/', sectionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSection = async (id, sectionData) => {
  try {
    const response = await apiClient.put(`/sections/${id}/`, sectionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSection = async (id) => {
  try {
    await apiClient.delete(`/sections/${id}/`);
  } catch (error) {
    throw error;
  }
};

// --- Classrooms ---
export const getClassrooms = async () => {
  try {
    const response = await apiClient.get('/classrooms/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createClassroom = async (classroomData) => {
  try {
    const response = await apiClient.post('/classrooms/', classroomData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateClassroom = async (id, classroomData) => {
  try {
    const response = await apiClient.put(`/classrooms/${id}/`, classroomData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteClassroom = async (id) => {
  try {
    await apiClient.delete(`/classrooms/${id}/`);
  } catch (error) {
    throw error;
  }
};

// Renaming classes to classrooms for clarity
// export const getClasses = getClassrooms;
// export const createClass = createClassroom;

export const getAcademicYears = async () => {
  try {
    const response = await apiClient.get('/academic-years/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAcademicYear = async (academicYearData) => {
  try {
    const response = await apiClient.post('/academic-years/', academicYearData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSemestersByAcademicYear = async (academicYearId) => {
  try {
    const response = await apiClient.get(`/academic-years/${academicYearId}/semesters/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateSemester = async (semesterId, semesterData) => {
  try {
    const response = await apiClient.patch(`/semesters/${semesterId}/`, semesterData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- PromoModuleSemester Assignments ---
export const createPromoModuleAssignment = async (assignmentData) => {
  try {
    const response = await apiClient.post('/promo-module-assignments/', assignmentData);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.detail || error.response?.data || error.message;
    throw new Error(errorMessage);
  }
};

// Add functions for getting and deleting assignments as needed later
// export const getPromoModuleAssignments = async (filters = {}) => { ... };
// export const deletePromoModuleAssignment = async (assignmentId) => { ... };

// --- Modules (Version Modules) ---
export const getModules = async () => {
  try {
    const response = await apiClient.get('/modules/');
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Add create/update/delete for VersionModules if needed later