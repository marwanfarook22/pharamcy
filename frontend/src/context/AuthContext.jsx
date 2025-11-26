import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, ...userData } = response.data;
      
      if (!token) {
        return { 
          success: false, 
          error: 'No token received from server' 
        };
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.title
        || error.message
        || 'Login failed. Please check your credentials.';
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      // Ensure proper field names match backend DTO
      const registerData = {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || null,
        role: userData.role || 'Customer'
      };
      
      const response = await authAPI.register(registerData);
      const { token, ...user } = response.data;
      
      if (!token) {
        return { 
          success: false, 
          error: 'No token received from server' 
        };
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errors = error.response.data;
        if (errors.errors) {
          // ModelState errors
          const errorMessages = Object.values(errors.errors)
            .flat()
            .join(', ');
          return { 
            success: false, 
            error: errorMessages || errors.message || 'Validation failed' 
          };
        }
      }
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.title
        || error.message
        || 'Registration failed. Please try again.';
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    // Store last logout time for admin users
    if (user && (user.role === 'Admin' || user.role === 'Pharmacist')) {
      const logoutTime = new Date().toISOString();
      localStorage.setItem('adminLastLogout', logoutTime);
      console.log('🔔 Admin logout - saved logout time:', logoutTime);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === 'Admin' || user?.role === 'Pharmacist';
  };

  const getLastLogoutTime = () => {
    const lastLogout = localStorage.getItem('adminLastLogout');
    return lastLogout ? new Date(lastLogout) : null;
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin: isAdmin(),
    loading,
    getLastLogoutTime,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

