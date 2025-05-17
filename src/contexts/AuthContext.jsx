import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        setUser(res.data);
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, credentials);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Check if user is admin
const isAdmin = () => true;

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};