import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = async (userId) => {
    try {
      const profileData = await authService.getProfile(userId);
      setProfile(profileData);
      return profileData;
    } catch (err) {
      console.error('Error loading profile:', err);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async ({ email, password }) => {
    setError(null);
    const data = await authService.login({ email, password });
    setUser(data.user);
    setProfile(data.profile);
    return data;
  };

  const register = async (formData) => {
    setError(null);
    const data = await authService.register(formData);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated');
    const updated = await authService.updateProfile(user.id, updates);
    setProfile(updated);
    return updated;
  };

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin' || user?.role === 'admin',
    isStudent: profile?.role === 'student' || user?.role === 'student',
    login,
    register,
    logout,
    updateProfile,
    loadProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
