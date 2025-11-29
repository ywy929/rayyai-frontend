import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, getToken, setToken, removeToken } from '@/services/api';

const AuthContext = createContext(null);

/**
 * Derive first and last name from full name string
 */
const deriveNameParts = (fullName = '') => {
  const parts = fullName.split(' ').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

/**
 * Normalize gender value for display
 */
const normalizeGender = (value) => {
  if (!value) return '';
  const lower = value.toString().toLowerCase();
  const map = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
    'prefer not to say': 'Prefer not to say',
  };
  return map[lower] || value;
};

/**
 * Normalize user profile data
 */
const normalizeUser = (profile) => {
  if (!profile) return null;

  const { firstName, lastName } = deriveNameParts(
    profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
  );

  return {
    ...profile,
    first_name: profile.first_name ?? firstName,
    last_name: profile.last_name ?? lastName,
    full_name: `${profile.first_name || firstName || ''} ${profile.last_name || lastName || ''}`.trim(),
    gender: normalizeGender(profile.gender),
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? normalizeUser(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch and update user profile from API
   */
  const fetchUserProfile = useCallback(async () => {
    try {
      const profile = await authApi.getCurrentUser();
      const normalized = normalizeUser(profile);
      setUser(normalized);
      localStorage.setItem('user', JSON.stringify(normalized));
      setIsAuthenticated(true);
      setError(null);
      return normalized;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  /**
   * Login with credentials
   */
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(credentials);

      // Token is set by authApi.login
      if (response.user) {
        const normalized = normalizeUser(response.user);
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify(normalized));
      }

      setIsAuthenticated(true);

      // Fetch fresh profile
      await fetchUserProfile();

      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  /**
   * Register new user
   */
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register(userData);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    authApi.logout();
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  /**
   * Update user state (for profile updates)
   */
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = normalizeUser({ ...prev, ...updates });
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * Refresh user profile from API
   */
  const refreshProfile = useCallback(async () => {
    if (!getToken()) return null;
    return fetchUserProfile();
  }, [fetchUserProfile]);

  /**
   * Check and restore session on mount
   */
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    fetchUserProfile()
      .catch((err) => {
        console.error('Failed to restore session:', err);
        removeToken();
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fetchUserProfile]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    updateUser,
    refreshProfile,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
