import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  // Add a loading state to prevent flickering (showing guest nav for 0.1s)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Local Storage when the app loads
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token) {
      setIsAuthenticated(true);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    // 2. Save data to Local Storage so it survives refresh
    // (Note: Token is already saved in LoginPage, but we save User here too)
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // 3. Clear Local Storage on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Prevent the app from rendering until we check for the token
  if (loading) {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};