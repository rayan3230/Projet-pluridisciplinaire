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
// Add getSpeciality, updateSpeciality, deleteSpeciality as needed

// --- Promos ---
export const getPromos = async (specialityId = null) => {
  try {
    const params = specialityId ? { speciality: specialityId } : {};
    const response = await apiClient.get('/promos/', { params });
    return response.data;
  } catch (error) {
    console.error('Get Promos API error:', error.response || error.message);
    throw error;
  }
};

export const createPromo = async (promoData) => {
  // promoData should include { name, speciality: specialityId }
  try {
    const response = await apiClient.post('/promos/', promoData);
    return response.data;
  } catch (error) {
    console.error('Create Promo API error:', error.response || error.message);
    throw error;
  }
};
// Add getPromo, updatePromo, deletePromo as needed

// --- Sections ---
export const getSections = async (promoId = null) => {
  try {
    const params = promoId ? { promo: promoId } : {};
    const response = await apiClient.get('/sections/', { params });
    return response.data;
  } catch (error) {
    console.error('Get Sections API error:', error.response || error.message);
    throw error;
  }
};

export const createSection = async (sectionData) => {
  // sectionData should include { name, promo: promoId }
  try {
    const response = await apiClient.post('/sections/', sectionData);
    return response.data;
  } catch (error) {
    console.error('Create Section API error:', error.response || error.message);
    throw error;
  }
};
// Add getSection, updateSection, deleteSection as needed

// --- Classes (Rooms) ---
export const getClasses = async (sectionId = null) => {
  try {
    const params = sectionId ? { section: sectionId } : {};
    const response = await apiClient.get('/classes/', { params });
    return response.data;
  } catch (error) {
    console.error('Get Classes API error:', error.response || error.message);
    throw error;
  }
};

export const createClass = async (classData) => {
  // classData includes { name, type, has_projector, section, tp_computers? }
  try {
    const response = await apiClient.post('/classes/', classData);
    return response.data;
  } catch (error) {
    console.error('Create Class API error:', error.response || error.message);
    throw error;
  }
};
// Add getClass, updateClass, deleteClass as needed 