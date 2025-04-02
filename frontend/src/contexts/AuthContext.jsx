import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient, { getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
          setIsAuthenticated(false);
          setUser(null);
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

  const login = async (token) => {
    localStorage.setItem('authToken', token);
    try {
        await new Promise(resolve => setTimeout(resolve, 0));
        const response = await getCurrentUser();
        setUser(response.data);
        setIsAuthenticated(true);
    } catch(error) {
        console.error("Failed to fetch user after login:", error);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
        throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

   if (loading) {
     return <div className="flex justify-center items-center min-h-screen">Uygulama Yükleniyor...</div>;
   }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}