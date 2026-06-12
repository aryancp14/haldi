import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    axios.defaults.baseURL = API_BASE_URL;

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');

      if (token) {
        try {
          const response = await axios.get('/api/auth/me');

          setAdmin(response.data.admin);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check failed:', error);

          localStorage.removeItem('adminToken');
          delete axios.defaults.headers.common['Authorization'];
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('Login Request URL:', `${API_BASE_URL}/api/auth/login`);
      console.log('Login Data:', credentials);

      const response = await axios.post('/api/auth/login', credentials);

      console.log('Login Success:', response.data);

      const { token, admin: adminData } = response.data;

      localStorage.setItem('adminToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAdmin(adminData);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      console.error('Login Error:', error);
      console.error('Response:', error.response?.data);

      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (credentials) => {
    try {
      console.log('Register Request URL:', `${API_BASE_URL}/api/auth/register`);
      console.log('Register Data:', credentials);

      const response = await axios.post('/api/auth/register', credentials);

      console.log('Register Success:', response.data);

      const { token, admin: adminData } = response.data;

      localStorage.setItem('adminToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setAdmin(adminData);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      console.error('Register Error:', error);
      console.error('Response:', error.response?.data);

      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];

      setAdmin(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;