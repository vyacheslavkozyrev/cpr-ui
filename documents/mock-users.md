# Mock User Roles Guide

This guide explains how to test different user roles in mock mode.

## How to Switch Mock User Roles

1. Open `.env.mock` file
2. Change the `VITE_MOCK_USER_ROLE` value
3. Restart the development server with `yarn start:mock`

## Available Mock Users

### Employee (Basic User)
```bash
VITE_MOCK_USER_ROLE=employee
```
- **Name**: John Employee
- **Email**: john.employee@cpr.com
- **Roles**: [`CPR.Employee`]
- **Department**: Engineering
- **Position**: Software Developer
- **Permissions**: Basic employee access, can view own reviews

### People Manager
```bash
VITE_MOCK_USER_ROLE=people-manager
```
- **Name**: Sarah Manager
- **Email**: sarah.manager@cpr.com
- **Roles**: [`CPR.Employee`, `CPR.PeopleManager`]
- **Department**: Engineering
- **Position**: Engineering Manager
- **Permissions**: Can manage team members, conduct reviews, view team data

### Solution Owner
```bash
VITE_MOCK_USER_ROLE=solution-owner
```
- **Name**: Mike Owner
- **Email**: mike.owner@cpr.com
- **Roles**: [`CPR.Employee`, `CPR.SolutionOwner`]
- **Department**: Product
- **Position**: Product Manager
- **Permissions**: Can manage solutions, projects, and cross-team initiatives

### Director
```bash
VITE_MOCK_USER_ROLE=director
```
- **Name**: Lisa Director
- **Email**: lisa.director@cpr.com
- **Roles**: [`CPR.Employee`, `CPR.Director`]
- **Department**: Engineering
- **Position**: Engineering Director
- **Permissions**: Organization-wide visibility, strategic planning access

### Administrator
```bash
VITE_MOCK_USER_ROLE=administrator
```
- **Name**: Admin User
- **Email**: admin@cpr.com
- **Roles**: [`CPR.Employee`, `CPR.Administrator`]
- **Department**: IT
- **Position**: System Administrator
- **Permissions**: Full system access, user management, system configuration

## Testing Role-Based Features

Use different mock users to test:

1. **Navigation menus** - Different roles should see different menu items
2. **Data access** - Users should only see data they have permission for
3. **Action buttons** - Role-specific actions should be enabled/disabled
4. **API endpoints** - Test authorization on different endpoints
5. **UI components** - Role-based UI elements and workflows

## Quick Testing Commands

```bash
# Test as Employee (default)
yarn start:mock-employee

# Test as People Manager  
yarn start:mock-manager

# Test as Solution Owner
yarn start:mock-owner

# Test as Director
yarn start:mock-director

# Test as Administrator
yarn start:mock-admin

# Alternative: Use the base mock command (uses .env.mock setting)
yarn start:mock
```

## Adding New Mock Users

To add new mock user profiles:

1. Edit `src/config/auth.ts`
2. Add new user profile to `authConfig.mockUsers`
3. Update this documentation
4. Add the new role option to `.env.mock` comments