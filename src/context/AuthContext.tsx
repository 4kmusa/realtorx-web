import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const ERPNEXT_URL = import.meta.env.VITE_ERPNEXT_URL || 'http://172.23.173.190:8000';
const API_BASE = import.meta.env.PROD ? '/api/erp' : `${ERPNEXT_URL}/api`;
const STORAGE_KEY = 'realtorx_auth_user';

export interface AuthUser {
  email: string;
  full_name: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  user_image?: string;
  roles: string[];
  is_customer: boolean;
  is_dealer: boolean;
  is_website_user: boolean;
}

interface SignupData {
  email: string;
  full_name: string;
  phone: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ═══════════════════════════════════════════════════════
// Helper: Save / Read user from localStorage
// ═══════════════════════════════════════════════════════
function saveUserToStorage(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function readUserFromStorage(): AuthUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse stored user:', e);
  }
  return null;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readUserFromStorage());
  const [loading, setLoading] = useState(true);

  // ═══════════════════════════════════════════════════════
  // Build AuthUser from raw data
  // ═══════════════════════════════════════════════════════
  function buildAuthUser(data: any): AuthUser {
    const roles: string[] = (data.roles || []).map((r: any) =>
      typeof r === 'string' ? r : r.role
    );

    if (roles.length === 0) roles.push('Website User');

    return {
      email: data.email || data.name || '',
      full_name:
        data.full_name ||
        `${data.first_name || ''} ${data.last_name || ''}`.trim() ||
        data.email,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone: data.phone || data.mobile_no || '',
      user_image: data.user_image || '',
      roles,
      is_customer: roles.includes('Customer'),
      is_dealer: roles.includes('Dealer'),
      is_website_user: roles.includes('Website User'),
    };
  }

  // ═══════════════════════════════════════════════════════
  // Refresh user from backend (best-effort, silently fails)
  // ═══════════════════════════════════════════════════════
  const refreshUser = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/method/frappe.auth.get_logged_user`,
        {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const email = data.message;

      if (!email || email === 'Guest') return;

      const userResponse = await fetch(
        `${API_BASE}/resource/User/${encodeURIComponent(email)}`,
        {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        }
      );

      if (!userResponse.ok) return;

      const userData = await userResponse.json();
      const authUser = buildAuthUser(userData.data);

      setUser(authUser);
      saveUserToStorage(authUser);
    } catch (error) {
      console.warn('Session refresh skipped:', error);
    }
  };

  // ═══════════════════════════════════════════════════════
  // Manually update user role in localStorage
  // (Bypasses session cookie issue on cross-origin)
  // ═══════════════════════════════════════════════════════
  const updateUserRole = (role: string) => {
    if (!user) return;

    const updatedUser: AuthUser = {
      ...user,
      roles: [...new Set([...user.roles, role])],
      is_customer: role === 'Customer' ? true : user.is_customer,
      is_dealer: role === 'Dealer' ? true : user.is_dealer,
    };

    setUser(updatedUser);
    saveUserToStorage(updatedUser);
  };

  // ═══════════════════════════════════════════════════════
  // Signup
  // ═══════════════════════════════════════════════════════
  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE}/method/realtorx.api.signup`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || result.exception) {
        return {
          success: false,
          error: result.exception || result.message || 'Signup failed',
        };
      }

      // Build user object from signup response + form data
      const authUser: AuthUser = {
        email: data.email,
        full_name: data.full_name,
        first_name: data.full_name.split(' ')[0] || '',
        last_name: data.full_name.split(' ').slice(1).join(' ') || '',
        phone: data.phone,
        roles: ['Website User'],
        is_customer: false,
        is_dealer: false,
        is_website_user: true,
      };

      setUser(authUser);
      saveUserToStorage(authUser);

      // Try to establish session (best-effort)
      await login(data.email, data.password);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  // ═══════════════════════════════════════════════════════
  // Login — accepts "Logged In" AND "No App"
  // ═══════════════════════════════════════════════════════
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const formData = new URLSearchParams();
      formData.append('usr', email);
      formData.append('pwd', password);

      const response = await fetch(`${API_BASE}/method/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const result = await response.json();

      const authSuccess =
        response.ok &&
        (result.message === 'Logged In' ||
          result.message === 'No App' ||
          result.full_name);

      if (!authSuccess) {
        return {
          success: false,
          error: result.message || 'Invalid email or password',
        };
      }

      const authUser: AuthUser = {
        email: email,
        full_name: result.full_name || email,
        first_name: (result.full_name || email).split(' ')[0] || '',
        last_name: (result.full_name || '').split(' ').slice(1).join(' ') || '',
        phone: '',
        roles: ['Website User'],
        is_customer: false,
        is_dealer: false,
        is_website_user: true,
      };

      setUser(authUser);
      saveUserToStorage(authUser);

      // Best-effort: fetch full details from backend
      setTimeout(() => refreshUser(), 500);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  };

  // ═══════════════════════════════════════════════════════
  // Logout
  // ═══════════════════════════════════════════════════════
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/method/logout`, {
        credentials: 'include',
      });
    } catch (error) {
      console.warn('Logout API error:', error);
    }
    setUser(null);
    saveUserToStorage(null);
  };

  // ═══════════════════════════════════════════════════════
  // On mount — try to refresh
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
        refreshUser,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
