const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Register user
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Save user data to localStorage
    if (data.token) {
      localStorage.setItem('user', JSON.stringify(data));
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const login = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save user data to localStorage
    if (data.token) {
      localStorage.setItem('user', JSON.stringify(data));
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return !!user && !!user.token;
};

// Get user profile
export const getProfile = async () => {
  try {
    const user = getCurrentUser();
    
    if (!user || !user.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Change user password
export const changePassword = async (passwordData) => {
  try {
    const user = getCurrentUser();
    
    if (!user || !user.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/user/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
