# FeedbackRequest Components

This directory contains all components related to the Feedback Request Management feature (F0004).

## Directory Structure

- **form/** - Components for creating feedback requests
  - Request creation form
  - Employee multi-select with search and filters
  - Project/goal selectors
  - Message input with character counter
  - Due date picker with quick select chips
  - Form validation and error handling
  - Draft auto-save functionality

- **lists/** - Components for displaying feedback request lists
  - Sent requests list (requestor view)
  - Todo requests list (recipient view)
  - Team requests lists (manager view: sent by team / received by team)
  - Pagination controls
  - Filter and sort dropdowns
  - Summary statistics

- **cards/** - Components for individual feedback request items
  - Request card (list item view with expandable details)
  - Recipient status badges
  - Progress indicators for multi-recipient requests
  - Action buttons (send reminder, cancel, view feedback)
  - Overdue warnings

- **detail/** - Components for detailed request view
  - Full request details page
  - Complete recipient list with individual statuses
  - Per-recipient action buttons
  - Request metadata (created, due date, message, etc.)
  - Related project/goal information

## Usage

Components follow atomic design principles:

- **Atoms**: Individual UI elements (buttons, badges, status indicators)
- **Molecules**: Composed components (recipient card, filter dropdown)
- **Organisms**: Complete features (feedback request form, request list)

All components use:

- TypeScript for type safety
- Material-UI for consistent design
- react-i18next for internationalization
- React Query for data fetching and caching
- Zustand for local state management (drafts, UI state)

## Development Notes

- All components are feature-scoped (no shared generic components here)
- API integration uses types from `src/types/feedbackRequest.ts`
- i18n keys from `public/locales/{en|es}/feedbackRequest.json`
- Follow CPR naming conventions: PascalCase for components, camelCase for functions/variables
