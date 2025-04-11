import apiClient from '../config/axiosConfig';

// --- Base Modules ---
export const getBaseModules = async () => {
  try {
    const response = await apiClient.get('/modules/base/');
    return response.data;
  } catch (error) {
    console.error('Get Base Modules API error:', error.response || error.message);
    throw error;
  }
};

export const createBaseModule = async (moduleData) => {
  // moduleData = { name, code, coef }
  try {
    const response = await apiClient.post('/modules/base/', moduleData);
    return response.data;
  } catch (error) {
    console.error('Create Base Module API error:', error.response || error.message);
    throw error;
  }
};
// Add getBaseModule, updateBaseModule, deleteBaseModule as needed

// --- Version Modules ---
export const getVersionModules = async (baseModuleId = null) => {
  try {
    const params = baseModuleId ? { base_module: baseModuleId } : {};
    const response = await apiClient.get('/modules/version/', { params });
    return response.data;
  } catch (error) {
    console.error('Get Version Modules API error:', error.response || error.message);
    throw error;
  }
};

export const createVersionModule = async (moduleData) => {
  // moduleData = { name, base_module, cours_hours, td_hours, tp_hours }
  try {
    const response = await apiClient.post('/modules/version/', moduleData);
    return response.data;
  } catch (error) {
    console.error('Create Version Module API error:', error.response || error.message);
    throw error;
  }
};
// Add getVersionModule, updateVersionModule, deleteVersionModule as needed

// --- Helper for Schedule Generation/Teacher Assignment ---
export const getModulesForPromo = async (promoId, semesterId) => {
    // This might need a specific backend endpoint
    try {
      // Example: Might fetch version modules filtered by promo/semester linkage
      const response = await apiClient.get('/modules/version/', {
        params: { promo: promoId, semester: semesterId } // Adjust params based on API design
      });
      return response.data;
    } catch (error) {
      console.error('Get Modules for Promo/Semester API error:', error.response || error.message);
      throw error;
    }
  }; 