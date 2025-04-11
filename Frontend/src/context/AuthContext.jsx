import React, { createContext, useState, useContext, useEffect } from 'react';
// Remove API key setters import
// import { setGlobalApiKey, clearGlobalApiKey } from '../config/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Only store user info, no API key
  const [user, setUser] = useState(null); 
  // Remove apiKey state
  // const [apiKey, setApiKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 

  // No automatic session checking possible without cookies/tokens
  useEffect(() => {
    // Check local storage potentially? (Less secure)
    // Or just assume logged out on load
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    const userObject = {
      id: userData.id,
      name: userData.full_name,
      email: userData.scope_email,
      isAdmin: userData.is_admin || false,
      isTeacher: userData.is_teacher || false,
      needsPasswordChange: userData.needs_password_change || false,
    };
    setUser(userObject);
    // Remove API key setting
    // setApiKey(userData.api_key);
    // setGlobalApiKey(userData.api_key);
  };

  const logout = () => {
    setUser(null);
    // Remove API key clearing
    // setApiKey(null);
    // clearGlobalApiKey();
    // TODO: Add API call to backend to invalidate API Key if needed (requires backend endpoint)
  };

  const value = {
    user,
    // Remove apiKey from context value
    // apiKey, 
    isAdmin: user?.isAdmin ?? false,
    isTeacher: user?.isTeacher ?? false,
    // Base authentication purely on user object existing
    isAuthenticated: !!user, 
    needsPasswordChange: user?.needsPasswordChange ?? false,
    isLoading, 
    login, 
    logout, 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 