import apiClient from '../config/axiosConfig';

// --- Base Modules ---
export const getBaseModules = async () => {
  try {
    const response = await apiClient.get('/base-modules/');
    return response.data;
  } catch (error) {
    console.error('Get Base Modules API error:', error.response || error.message);
    throw error;
  }
};

export const createBaseModule = async (moduleData) => {
  // moduleData = { name, code, coef }
  try {
    const response = await apiClient.post('/base-modules/', moduleData);
    return response.data;
  } catch (error) {
    console.error('Create Base Module API error:', error.response || error.message);
    throw error;
  }
};

export const updateBaseModule = async (id, moduleData) => {
  try {
    const response = await apiClient.put(`/base-modules/${id}/`, moduleData);
    return response.data;
  } catch (error) {
    console.error(`Update Base Module ${id} API error:`, error.response || error.message);
    throw error;
  }
};

export const deleteBaseModule = async (id) => {
  try {
    await apiClient.delete(`/base-modules/${id}/`);
  } catch (error) {
    console.error(`Delete Base Module ${id} API error:`, error.response || error.message);
    throw error;
  }
};

// --- Version Modules ---
export const getVersionModules = async (baseModuleId = null) => {
  try {
    const params = baseModuleId ? { base_module_id: baseModuleId } : {};
    const response = await apiClient.get('/version-modules/', { params });
    return response.data;
  } catch (error) {
    console.error('Get Version Modules API error:', error.response || error.message);
    throw error;
  }
};

export const createVersionModule = async (moduleData) => {
  // moduleData = { version_name, base_module_id, cours_hours, td_hours, tp_hours }
  try {
    const response = await apiClient.post('/version-modules/', moduleData);
    return response.data;
  } catch (error) {
    console.error('Create Version Module API error:', error.response || error.message);
    throw error;
  }
};

export const updateVersionModule = async (id, moduleData) => {
  try {
    const response = await apiClient.put(`/version-modules/${id}/`, moduleData);
    return response.data;
  } catch (error) {
    console.error(`Update Version Module ${id} API error:`, error.response || error.message);
    throw error;
  }
};

export const deleteVersionModule = async (id) => {
  try {
    await apiClient.delete(`/version-modules/${id}/`);
  } catch (error) {
    console.error(`Delete Version Module ${id} API error:`, error.response || error.message);
    throw error;
  }
};

// --- Helper for Schedule Generation/Teacher Assignment ---
export const getModulesForPromo = async (promoId, semesterId) => {
    // Note: Assumes backend API supports filtering version modules by promo & semester
    try {
      const response = await apiClient.get('/version-modules/', {
        params: { promo: promoId, semester: semesterId }
      });
      return response.data;
    } catch (error) {
      console.error('Get Modules for Promo/Semester API error:', error.response || error.message);
      throw error;
    }
  }; 