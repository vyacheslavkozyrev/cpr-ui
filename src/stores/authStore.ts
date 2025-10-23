import type { AccountInfo } from '@azure/msal-browser';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { authConfig } from '../config/auth';
import { authService } from '../services/authService';

// Authentication types following T/I/E conventions
export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  tenantId: string;
  accessToken?: string;
  idToken?: string;
}

export interface IAuthState {
  // Authentication status
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User data
  user: IAuthUser | null;
  account: AccountInfo | null;
  
  // Token management
  accessToken: string | null;
  idToken: string | null;
  
  // Authentication mode
  isStubMode: boolean;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setUser: (user: IAuthUser | null) => void;
  setAccount: (account: AccountInfo | null) => void;
  setTokens: (accessToken: string | null, idToken: string | null) => void;
  setStubMode: (enabled: boolean) => void;
  
  // Authentication methods
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  
  // Utility methods
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  reset: () => void;
}

// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  account: null,
  accessToken: null,
  idToken: null,
  isStubMode: authConfig.enableStubAuth,
};

// Create the authentication store
export const useAuthStore = create<IAuthState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,
    
    // Basic setters
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
    setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),
    setUser: (user: IAuthUser | null) => set({ user }),
    setAccount: (account: AccountInfo | null) => set({ account }),
    setTokens: (accessToken: string | null, idToken: string | null) => 
      set({ accessToken, idToken }),
    setStubMode: (enabled: boolean) => set({ isStubMode: enabled }),
    
    // Authentication methods
    login: async () => {
      const { isStubMode } = get();
      
      set({ isLoading: true, error: null });
      
      try {
        if (isStubMode) {
          // Stub authentication - select user based on mock role
          const selectedMockUser = authConfig.mockUsers[authConfig.mockUserRole as keyof typeof authConfig.mockUsers] || authConfig.mockUsers.employee;
          
          const stubUser: IAuthUser = {
            ...selectedMockUser,
            accessToken: 'stub-access-token',
            idToken: 'stub-id-token',
          };
          
          set({
            isAuthenticated: true,
            user: stubUser,
            accessToken: 'stub-access-token',
            idToken: 'stub-id-token',
          });
        } else {
          // Real MSAL authentication
          const result = await authService.loginPopup();
          const accessToken = await authService.getAccessToken();
          const account = result.account;
          
          if (account) {
            const user = authService.convertToAuthUser(
              account, 
              accessToken || undefined, 
              result.idToken
            );
            
            set({
              isAuthenticated: true,
              user,
              account,
              accessToken,
              idToken: result.idToken,
            });
          }
        }
      } catch (error) {
        const errorMessage = isStubMode 
          ? (error instanceof Error ? error.message : 'Authentication failed')
          : authService.handleAuthError(error);
          
        set({ 
          error: errorMessage,
          isAuthenticated: false,
          user: null,
        });
      } finally {
        set({ isLoading: false });
      }
    },
    
    logout: async () => {
      const { isStubMode, account } = get();
      
      set({ isLoading: true, error: null });
      
      try {
        if (isStubMode) {
          // Stub logout
          set({
            isAuthenticated: false,
            user: null,
            account: null,
            accessToken: null,
            idToken: null,
          });
        } else {
          // Real MSAL logout
          await authService.logout(account || undefined);
          
          set({
            isAuthenticated: false,
            user: null,
            account: null,
            accessToken: null,
            idToken: null,
          });
        }
      } catch (error) {
        const errorMessage = isStubMode 
          ? (error instanceof Error ? error.message : 'Logout failed')
          : authService.handleAuthError(error);
          
        set({ error: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },
    
    getAccessToken: async (): Promise<string | null> => {
      const { isStubMode, accessToken } = get();
      
      if (isStubMode) {
        return accessToken;
      }
      
      try {
        const token = await authService.getAccessToken();
        if (token) {
          set({ accessToken: token });
        }
        return token;
      } catch (error) {
        console.error('Failed to get access token:', error);
        set({ error: authService.handleAuthError(error) });
        return null;
      }
    },
    
    // Utility methods
    hasRole: (role: string): boolean => {
      const { user } = get();
      return user?.roles?.includes(role) ?? false;
    },
    
    hasAnyRole: (roles: string[]): boolean => {
      const { user } = get();
      return roles.some(role => user?.roles?.includes(role)) ?? false;
    },
    
    isAdmin: (): boolean => {
      const { hasRole } = get();
      return hasRole('CPR.Admin');
    },
    
    reset: () => set(initialState),
  }))
);

// Utility hooks for common authentication checks
export const useAuth = () => {
  const auth = useAuthStore();
  return {
    ...auth,
    isLoggedIn: auth.isAuthenticated && !!auth.user,
  };
};

export const useAuthUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);

// Initialize stub mode if enabled
if (authConfig.enableStubAuth) {
  console.log('Authentication running in stub mode');
}