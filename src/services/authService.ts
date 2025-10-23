import type {
    AccountInfo,
    AuthenticationResult,
    EndSessionRequest,
    PopupRequest,
    RedirectRequest,
    SilentRequest,
} from '@azure/msal-browser';
import {
    PublicClientApplication,
} from '@azure/msal-browser';
import { graphScopes, loginRequest, msalConfig } from '../config/auth';
import type { IAuthUser } from '../stores/authStore';

// Type definitions following conventions
type TMsalErrorCode = 'user_cancelled' | 'consent_required' | 'interaction_required';

interface IMsalError {
  errorCode?: TMsalErrorCode;
  errorMessage?: string;
  message?: string;
}

interface IIdTokenClaims {
  roles?: string[];
  [key: string]: unknown;
}

// Create the MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL
export const initializeMsal = async (): Promise<void> => {
  try {
    await msalInstance.initialize();
    
    // Handle redirect promise
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      console.log('MSAL redirect response:', response);
    }
  } catch (error) {
    console.error('MSAL initialization failed:', error);
    throw error;
  }
};

// Authentication service class
export class AuthService {
  private msalInstance: PublicClientApplication;

  constructor(msalInstance: PublicClientApplication) {
    this.msalInstance = msalInstance;
  }

  // Login with popup
  async loginPopup(): Promise<AuthenticationResult> {
    const loginRequestPopup: PopupRequest = {
      ...loginRequest,
      prompt: 'select_account',
    };

    try {
      const response = await this.msalInstance.loginPopup(loginRequestPopup);
      return response;
    } catch (error) {
      console.error('Login popup failed:', error);
      throw error;
    }
  }

  // Login with redirect
  async loginRedirect(): Promise<void> {
    const loginRequestRedirect: RedirectRequest = {
      ...loginRequest,
      prompt: 'select_account',
    };

    try {
      await this.msalInstance.loginRedirect(loginRequestRedirect);
    } catch (error) {
      console.error('Login redirect failed:', error);
      throw error;
    }
  }

  // Logout
  async logout(account?: AccountInfo): Promise<void> {
    const logoutRequest: EndSessionRequest = {
      account: account || this.msalInstance.getActiveAccount(),
      ...(msalConfig.auth.postLogoutRedirectUri && {
        postLogoutRedirectUri: msalConfig.auth.postLogoutRedirectUri,
      }),
    };

    try {
      await this.msalInstance.logoutRedirect(logoutRequest);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  // Get access token silently
  async getAccessToken(scopes: string[] = graphScopes.userRead): Promise<string | null> {
    const account = this.msalInstance.getActiveAccount();
    
    if (!account) {
      console.warn('No active account found');
      return null;
    }

    const silentRequest: SilentRequest = {
      scopes,
      account,
    };

    try {
      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      
      // Fallback to interactive token acquisition
      try {
        const response = await this.msalInstance.acquireTokenPopup({
          scopes,
          account,
        });
        return response.accessToken;
      } catch (interactiveError) {
        console.error('Interactive token acquisition failed:', interactiveError);
        throw interactiveError;
      }
    }
  }

  // Get current account
  getAccount(): AccountInfo | null {
    return this.msalInstance.getActiveAccount();
  }

  // Get all accounts
  getAllAccounts(): AccountInfo[] {
    return this.msalInstance.getAllAccounts();
  }

  // Set active account
  setActiveAccount(account: AccountInfo | null): void {
    this.msalInstance.setActiveAccount(account);
  }

  // Convert MSAL account to AuthUser
  convertToAuthUser(account: AccountInfo, accessToken?: string, idToken?: string): IAuthUser {
    return {
      id: account.localAccountId,
      name: account.name || account.username,
      email: account.username,
      roles: this.extractRoles(account),
      tenantId: account.tenantId,
      ...(accessToken && { accessToken }),
      ...(idToken && { idToken }),
    };
  }

  // Extract roles from account claims
  private extractRoles(account: AccountInfo): string[] {
    try {
      // Check for roles in the account's id token claims
      const claims = account.idTokenClaims as IIdTokenClaims;
      
      if (claims?.roles && Array.isArray(claims.roles)) {
        return claims.roles;
      }
      
      // Fallback to default user role
      return ['CPR.User'];
    } catch (error) {
      console.warn('Failed to extract roles from account:', error);
      return ['CPR.User'];
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const account = this.msalInstance.getActiveAccount();
    return !!account;
  }

  // Handle authentication errors
  handleAuthError(error: unknown): string {
    const msalError = error as IMsalError;
    
    if (msalError?.errorCode) {
      switch (msalError.errorCode) {
        case 'user_cancelled':
          return 'Login was cancelled by user';
        case 'consent_required':
          return 'Additional consent required';
        case 'interaction_required':
          return 'User interaction required';
        default:
          return msalError.errorMessage || 'Authentication failed';
      }
    }
    
    return msalError?.message || 'Unknown authentication error';
  }
}

// Create the authentication service instance
export const authService = new AuthService(msalInstance);

// Event handlers for MSAL events
msalInstance.addEventCallback((event) => {
  console.log('MSAL Event:', event);
  
  // Handle successful login
  if (event.eventType === 'msal:loginSuccess') {
    const account = event.payload as AccountInfo;
    msalInstance.setActiveAccount(account);
  }
  
  // Handle logout
  if (event.eventType === 'msal:logoutSuccess') {
    msalInstance.setActiveAccount(null);
  }
});

// Export for easier access
export { msalInstance as msal };

