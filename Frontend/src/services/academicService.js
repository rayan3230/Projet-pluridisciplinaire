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
// TODO: Add getSpeciality(id), updateSpeciality(id, data), deleteSpeciality(id)

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
  // Expecting { name, speciality_id } from the form
  try {
    const response = await apiClient.post('/promos/', promoData);
    return response.data;
  } catch (error) {
    console.error('Create Promo API error:', error.response || error.message);
    throw error;
  }
};
// TODO: Add getPromo(id), updatePromo(id, data), deletePromo(id)

// --- Sections ---
export const getSections = async (promoId = null) => {
  try {
    const params = promoId ? { promo_id: promoId } : {};
    const response = await apiClient.get('/sections/', { params });
    return response.data;
  } catch (error) {
    console.error('Get Sections API error:', error.response || error.message);
    throw error;
  }
};

export const createSection = async (sectionData) => {
  // Expecting { name, promo_id }
  try {
    const response = await apiClient.post('/sections/', sectionData);
    return response.data;
  } catch (error) {
    console.error('Create Section API error:', error.response || error.message);
    throw error;
  }
};
// TODO: Add getSection(id), updateSection(id, data), deleteSection(id)

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
  // Expecting { name, type, capacity, has_projector, computers_count }
  try {
    const response = await apiClient.post('/classrooms/', classroomData);
    return response.data;
  } catch (error) {
    console.error('Create Classroom API error:', error.response || error.message);
    throw error;
  }
};
// TODO: Add getClassroom(id), updateClassroom(id, data), deleteClassroom(id)

// Renaming classes to classrooms for clarity
// export const getClasses = getClassrooms;
// export const createClass = createClassroom; 