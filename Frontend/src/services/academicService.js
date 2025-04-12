import apiClient from '../config/axiosConfig';

// --- Specialities ---
export const getSpecialities = async () => {
  try {
    const response = await apiClient.get('/specialities/');
    return response.data;
  } catch (error) {
    console.error('Get Specialities API error:', error.response || error.message);
    throw error;
  }
};

export const createSpeciality = async (specialityData) => {
  try {
    const response = await apiClient.post('/specialities/', specialityData);
    return response.data;
  } catch (error) {
    console.error('Create Speciality API error:', error.response || error.message);
    throw error;
  }
};

export const updateSpeciality = async (id, specialityData) => {
  try {
    const response = await apiClient.put(`/specialities/${id}/`, specialityData);
    return response.data;
  } catch (error) {
    console.error(`Update Speciality ${id} API error:`, error.response || error.message);
    throw error;
  }
};

export const deleteSpeciality = async (id) => {
  try {
    await apiClient.delete(`/specialities/${id}/`);
  } catch (error) {
    console.error(`Delete Speciality ${id} API error:`, error.response || error.message);
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
    console.error('Get Promos API error:', error.response || error.message);
    throw error;
  }
};

export const createPromo = async (promoData) => {
  try {
    const response = await apiClient.post('/promos/', promoData);
    return response.data;
  } catch (error) {
    console.error('Create Promo API error:', error.response || error.message);
    throw error;
  }
};

export const updatePromo = async (id, promoData) => {
  try {
    const response = await apiClient.put(`/promos/${id}/`, promoData);
    return response.data;
  } catch (error) {
    console.error(`Update Promo ${id} API error:`, error.response || error.message);
    throw error;
  }
};

export const deletePromo = async (id) => {
  try {
    await apiClient.delete(`/promos/${id}/`);
  } catch (error) {
    console.error(`Delete Promo ${id} API error:`, error.response || error.message);
    throw error;
  }
};

// --- Sections ---
export const getSections = async (filters = {}) => {
  try {
    const response = await apiClient.get('/sections/', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Get Sections API error:', error.response || error.message);
    throw error;
  }
};

export const createSection = async (sectionData) => {
  try {
    const response = await apiClient.post('/sections/', sectionData);
    return response.data;
  } catch (error) {
    console.error('Create Section API error:', error.response || error.message);
    throw error;
  }
};

export const updateSection = async (id, sectionData) => {
  try {
    const response = await apiClient.put(`/sections/${id}/`, sectionData);
    return response.data;
  } catch (error) {
    console.error(`Update Section ${id} API error:`, error.response || error.message);
    throw error;
  }
};

export const deleteSection = async (id) => {
  try {
    await apiClient.delete(`/sections/${id}/`);
  } catch (error) {
    console.error(`Delete Section ${id} API error:`, error.response || error.message);
    throw error;
  }
};

// --- Classrooms ---
export const getClassrooms = async () => {
  try {
    const response = await apiClient.get('/classrooms/');
    return response.data;
  } catch (error) {
    console.error('Get Classrooms API error:', error.response || error.message);
    throw error;
  }
};

export const createClassroom = async (classroomData) => {
  try {
    const response = await apiClient.post('/classrooms/', classroomData);
    return response.data;
  } catch (error) {
    console.error('Create Classroom API error:', error.response || error.message);
    throw error;
  }
};

export const updateClassroom = async (id, classroomData) => {
  try {
    const response = await apiClient.put(`/classrooms/${id}/`, classroomData);
    return response.data;
  } catch (error) {
    console.error(`Update Classroom ${id} API error:`, error.response || error.message);
    throw error;
  }
};

export const deleteClassroom = async (id) => {
  try {
    await apiClient.delete(`/classrooms/${id}/`);
  } catch (error) {
    console.error(`Delete Classroom ${id} API error:`, error.response || error.message);
    throw error;
  }
};

// Renaming classes to classrooms for clarity
// export const getClasses = getClassrooms;
// export const createClass = createClassroom; 