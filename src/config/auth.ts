import type { Configuration } from '@azure/msal-browser'
import { LogLevel } from '@azure/msal-browser'
import { logger } from '../utils/logger'

// MSAL Configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env['VITE_AZURE_CLIENT_ID'] || 'your-client-id-here',
    authority:
      import.meta.env['VITE_AZURE_AUTHORITY'] ||
      'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: import.meta.env['VITE_REDIRECT_URI'] || window.location.origin,
    postLogoutRedirectUri:
      import.meta.env['VITE_POST_LOGOUT_REDIRECT_URI'] ||
      window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (
        level: LogLevel,
        message: string,
        containsPii: boolean
      ) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            logger.error(message)
            return
          case LogLevel.Info:
            logger.info(message)
            return
          case LogLevel.Verbose:
            logger.debug(message)
            return
          case LogLevel.Warning:
            logger.warn(message)
            return
          default:
            return
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Verbose : LogLevel.Error,
    },
  },
}

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ['User.Read'],
}

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
}

// Scopes for accessing Microsoft Graph
export const graphScopes = {
  userRead: ['User.Read'],
  userReadAll: ['User.ReadBasic.All'],
  mailRead: ['Mail.Read'],
  calendarsRead: ['Calendars.Read'],
}

// Environment-specific configuration
export const authConfig = {
  // Development mode settings
  isDevelopment: import.meta.env.DEV,

  // API endpoints
  apiBaseUrl:
    import.meta.env['VITE_API_BASE_URL'] || 'https://localhost:5000/api',

  // Feature flags
  enableStubAuth: import.meta.env['VITE_ENABLE_STUB_AUTH'] === 'true',

  // Mock user role selection
  mockUserRole: import.meta.env['VITE_MOCK_USER_ROLE'] || 'employee',

  // Stub user data for development
  stubUser: {
    id: 'stub-user-001',
    name: 'Development User',
    email: 'dev.user@cpr.local',
    roles: ['CPR.User', 'CPR.Admin'],
    tenantId: 'stub-tenant-001',
  },

  // Mock user profiles for different roles
  // Using actual User IDs from database for stub authentication
  mockUsers: {
    employee: {
      id: 'c7746e91-a5e8-4f8b-9f22-f48374ffa2a4', // Eve Adams (Software Engineer) - Employee ID: ...0007
      name: 'Eve Adams',
      email: 'eve.adams@cpr.com',
      roles: ['Employee'],
      tenantId: 'mock-tenant-001',
      department: 'Engineering',
      position: 'Software Engineer',
    },
    'people-manager': {
      id: '977f4f1f-b3ce-4244-98fc-2c0d0248de88', // Henry Wilson (Director of Technical Support) - Employee ID: ...000a
      name: 'Henry Wilson',
      email: 'henry.wilson@cpr.com',
      roles: ['Employee', 'People Manager'],
      tenantId: 'mock-tenant-001',
      department: 'Support',
      position: 'Director of Technical Support',
    },
    'solution-owner': {
      id: 'so-001',
      name: 'Mike Owner',
      email: 'mike.owner@cpr.com',
      roles: ['Employee', 'Solution Owner'],
      tenantId: 'mock-tenant-001',
      department: 'Product',
      position: 'Director of Security Engineering',
    },
    director: {
      id: 'dir-001',
      name: 'Lisa Director',
      email: 'lisa.director@cpr.com',
      roles: ['Employee', 'Director'],
      tenantId: 'mock-tenant-001',
      department: 'Engineering',
      position: 'Director of Security Engineering',
    },
    administrator: {
      id: '679add6e-6c29-4e00-b6a5-b69c8e0f3445', // Administrator User
      name: 'Admin User',
      email: 'admin@cpr.com',
      roles: ['Employee', 'Administrator'],
      tenantId: 'mock-tenant-001',
      department: 'IT',
      position: 'System Administrator',
    },
  },
}
