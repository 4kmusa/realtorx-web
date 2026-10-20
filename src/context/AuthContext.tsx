import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import * as api from '../services/api/client';

// Identity comes only from the Frappe session (realtor_x.api.session.get_session_info).
// Nothing about the user is persisted in localStorage: editing browser storage can
// never change who the server thinks you are.

const LEGACY_STORAGE_KEY = 'realtorx_auth_user';

export interface AuthUser {
  email: string;
  full_name: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  user_image?: string;
  roles: string[];
  is_staff: boolean;
  /** ERPNext back office address (site config `realtorx_desk_url`), when configured. */
  desk_url: string | null;
  /** RealtorX membership as reported by the server (null when the user never applied). */
  member: MemberSummary | null;
}

export interface MemberSummary {
  status: string;
  member_type: string;
  member_id: string | null;
  is_approved: boolean;
  is_realtor: boolean;
  is_developer: boolean;
}

interface SignupData {
  email: string;
  full_name: string;
  phone: string;
  password: string;
}

type Result = { success: boolean; error?: string };

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (data: SignupData) => Promise<Result>;
  login: (email: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

interface SessionInfo {
  user: string;
  is_authenticated: boolean;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  user_image?: string;
  roles?: string[];
  is_staff?: boolean;
  member?: MemberSummary | null;
  desk_url?: string | null;
  csrf_token?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(info: SessionInfo): AuthUser {
  const roles = info.roles || [];
  return {
    email: info.user,
    full_name: info.full_name || info.user,
    first_name: info.first_name || '',
    last_name: info.last_name || '',
    phone: info.phone || '',
    user_image: info.user_image || '',
    roles,
    is_staff: !!info.is_staff,
    member: info.member || null,
    desk_url: info.desk_url || null,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const info = await api.callGet<SessionInfo>('realtor_x.api.session.get_session_info');
      if (!info?.is_authenticated) {
        api.setCsrfToken(null);
        setUser(null);
        return null;
      }
      api.setCsrfToken(info.csrf_token);
      const next = toAuthUser(info);
      setUser(next);
      return next;
    } catch {
      // Network failure: keep whatever state we had rather than logging the user out.
      return null;
    }
  }, []);

  const login = async (email: string, password: string): Promise<Result> => {
    try {
      await api.login(email.trim(), password);
      const next = await refreshUser();
      if (!next) return { success: false, error: 'Signed in, but the session could not be established. Please try again.' };
      return { success: true };
    } catch (error: any) {
      const message = error?.status === 401 ? 'Invalid email or password.' : error?.message;
      return { success: false, error: message || 'Sign in failed.' };
    }
  };

  const signup = async (data: SignupData): Promise<Result> => {
    try {
      await api.callPost('realtor_x.api.session.signup', { ...data });
    } catch (error: any) {
      return { success: false, error: error?.message || 'Sign up failed.' };
    }
    return login(data.email, data.password);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      /* session may already be gone */
    }
    setUser(null);
  };

  useEffect(() => {
    // Remove the identity cache written by older builds; it is no longer trusted.
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

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
