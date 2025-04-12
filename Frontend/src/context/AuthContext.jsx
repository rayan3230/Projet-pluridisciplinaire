import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
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
  };

  const logout = () => {
    setUser(null);
    // TODO: Add API call to backend to invalidate API Key if needed (requires backend endpoint)
  };

  const value = {
    user,
    isAdmin: user?.isAdmin ?? false,
    isTeacher: user?.isTeacher ?? false,
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