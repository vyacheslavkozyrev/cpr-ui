# CPR UI - Component Hierarchy & Page Layouts

**Purpose**: Visual guide for component structure, page layouts, and user flows

---

## Application Structure Overview

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │         MsalProvider (Auth)                      │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      QueryClientProvider (React Query)     │  │  │
│  │  │  ┌──────────────────────────────────────┐  │  │  │
│  │  │  │   ThemeProvider (MUI)                │  │  │  │
│  │  │  │  ┌────────────────────────────────┐  │  │  │  │
│  │  │  │  │   Router (React Router)       │  │  │  │  │
│  │  │  │  │   ├─ Public Routes            │  │  │  │  │
│  │  │  │  │   └─ Protected Routes         │  │  │  │  │
│  │  │  │  │       └─ AppLayout            │  │  │  │  │
│  │  │  │  │           ├─ Header           │  │  │  │  │
│  │  │  │  │           ├─ Sidebar          │  │  │  │  │
│  │  │  │  │           ├─ Main Content     │  │  │  │  │
│  │  │  │  │           └─ Footer           │  │  │  │  │
│  │  │  │  └────────────────────────────────┘  │  │  │  │
│  │  │  └──────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## AppLayout Structure

```
┌───────────────────────────────────────────────────────────┐
│  Header (AppBar)                                          │
│  ┌─────────┬──────────────────────────────┬───────────┐  │
│  │ Logo    │ Breadcrumbs/Page Title       │ User Menu │  │
│  │ Menu    │                              │ Theme     │  │
│  └─────────┴──────────────────────────────┴───────────┘  │
├─────────────┬─────────────────────────────────────────────┤
│             │                                             │
│  Sidebar    │           Main Content Area                 │
│  (Drawer)   │                                             │
│             │  ┌───────────────────────────────────────┐  │
│  Navigation │  │  Page Component                       │  │
│  Menu       │  │  ┌─────────────────────────────────┐  │  │
│             │  │  │  Page Header (title, actions)   │  │  │
│  - Dashboard│  │  ├─────────────────────────────────┤  │  │
│  ▾ Goals    │  │  │                                 │  │  │
│    • Tech   │  │  │  Page Content                   │  │  │
│    • Leader │  │  │  (Widgets, Tables, Forms, etc.) │  │  │
│    • Business│ │  │                                 │  │  │
│    • Soft   │  │  └─────────────────────────────────┘  │  │
│    • Domain │  └───────────────────────────────────────┘  │
│  ▾ Feedback │                                             │
│    • Received│                                            │
│    • Requests│                                            │
│  - Projects │                                             │
│  - Skills   │                                             │
│  - Career Map│                                            │
│  ▾ Team     │                                             │
│    • Diana P.│                                            │
│    • Eve A. │                                             │
│    • Yale B.│                                             │
│  - Taxonomy │                                             │
│             │                                             │
├─────────────┴─────────────────────────────────────────────┤
│  Footer (Optional - copyright, links)                     │
└───────────────────────────────────────────────────────────┘
```

---

## Page Layouts by User Persona

### 1. Employee Dashboard (Jane Smith)

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard > My Overview                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │
│  │ Active Goals  │  │   Feedback    │  │  Skills    │  │
│  │   Progress    │  │   Summary     │  │  Overview  │  │
│  │               │  │               │  │            │  │
│  │  4/6 On Track │  │  12 Received  │  │  15/20     │  │
│  │  2 Overdue    │  │  3 Pending    │  │  Advanced  │  │
│  └───────────────┘  └───────────────┘  └────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Recent Activity Feed                           │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  • Received feedback on "API Development" goal  │   │
│  │  • Completed task: "Code review best practices" │   │
│  │  • New feedback request from Peter Morrison     │   │
│  │  • Updated skill: React → Advanced              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  My Active Goals (Quick View)                   │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │ Improve API Design Skills                │   │   │
│  │  │ ████████████░░░░░░  60% | Due: Nov 30    │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │ Mentor Junior Developers                 │   │   │
│  │  │ ████████░░░░░░░░░░  40% | Due: Dec 15    │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Goals Page (Filtered by Category)

```
┌─────────────────────────────────────────────────────────┐
│  Goals > Technical Skills               [+ New Goal] [⚙️]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Category Tabs: [Technical] [Leadership] [Business]    │
│                 [Soft Skills] [Domain Specific] [All]  │
│                                                         │
│  Filters: [Status: All ▼] [Priority: All ▼] [🔍]       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Active Goals (4)                                │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │ Improve API Design Skills                  │ │   │
│  │  │ ████████████░░░░░░  60%                    │ │   │
│  │  │ Category: Technical Skills                 │ │   │
│  │  │ Skill: Backend Development → Senior        │ │   │
│  │  │ Due: Nov 30, 2025 | 3 tasks | [View]      │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │ Master React Performance Optimization      │ │   │
│  │  │ ████████░░░░░░░░░░  40%                    │ │   │
│  │  │ Category: Technical Skills                 │ │   │
│  │  │ Skill: Frontend Development → Expert       │ │   │
│  │  │ Due: Dec 15, 2025 | 5 tasks | [View]      │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Completed Goals (2)                             │   │
│  │  [Expand/Collapse]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Goal Detail Page

```
┌─────────────────────────────────────────────────────────┐
│  Goals > Improve API Design Skills    [Edit] [Archive] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Goal Information                                 │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  Title: Improve API Design Skills                │ │
│  │  Description: Master RESTful API design...       │ │
│  │  Skill: Backend Development                      │ │
│  │  Target Level: Senior                            │ │
│  │  Status: In Progress | Priority: High            │ │
│  │  Deadline: November 30, 2025                     │ │
│  │  Progress: ████████████░░░░░░  60%               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Tasks (3/5 completed)            [+ Add Task]   │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  ☑ Study REST API best practices                 │ │
│  │  ☑ Complete API Design course                    │ │
│  │  ☑ Review existing APIs                          │ │
│  │  ☐ Design new API endpoints                      │ │
│  │  ☐ Get peer review on design                     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Related Feedback (3)                             │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  "Great progress on API design..." - Peter M.    │ │
│  │  "Shows strong understanding..." - Diana P.      │ │
│  │  [View All Feedback]                              │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4. Goal Create/Edit Form

```
┌─────────────────────────────────────────────────────────┐
│  Goals > Create New Goal                    [Cancel]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Goal Details                                     │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  Title *                                          │ │
│  │  [________________________________]               │ │
│  │                                                   │ │
│  │  Description                                      │ │
│  │  [                                  ]             │ │
│  │  [                                  ]             │ │
│  │  [                                  ]             │ │
│  │                                                   │ │
│  │  Related Skill                                    │ │
│  │  [Select skill... ▼]                              │ │
│  │                                                   │ │
│  │  Target Skill Level                               │ │
│  │  [Select level... ▼]                              │ │
│  │                                                   │ │
│  │  Deadline                                         │ │
│  │  [MM/DD/YYYY 📅]                                  │ │
│  │                                                   │ │
│  │  Priority                                         │ │
│  │  ○ Low    ○ Medium    ● High                      │ │
│  │                                                   │ │
│  │  Visibility                                       │ │
│  │  ● Private    ○ Team    ○ Organization           │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  💡 AI Suggestions (Optional)                     │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  [Get SMART Goal Suggestions]                     │ │
│  │  [Suggest Tasks]                                  │ │
│  │  [Estimate Time Required]                         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                              [Save Goal] [Cancel]       │
└─────────────────────────────────────────────────────────┘
```

### 5. Projects Page

```
┌─────────────────────────────────────────────────────────┐
│  Projects > My Projects                  [+ New Project] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Filters: [All ▼] [Status: All ▼] [Team: All ▼] [🔍]   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Active Projects (3)                             │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │ User Authentication Refactor               │ │   │
│  │  │ ████████████░░░░░░  60% | Due: Nov 30      │ │   │
│  │  │ Team: Engineering | Owner: Peter Morrison │ │   │
│  │  │ 4 linked goals | [View Details]           │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │ Mobile App Redesign                        │ │   │
│  │  │ ████████░░░░░░░░░░  40% | Due: Dec 15      │ │   │
│  │  │ Team: Design+Eng | Owner: Diana Prince    │ │   │
│  │  │ 7 linked goals | [View Details]           │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Completed Projects (5)                          │   │
│  │  [Expand/Collapse]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6. Skills Self-Assessment Page

```
┌─────────────────────────────────────────────────────────┐
│  Skills > My Skills Assessment              [Save]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  My Current Position: Senior Frontend Engineer  │   │
│  │  Target Position: Staff Frontend Engineer       │   │
│  │  Skills Assessed: 15/20 | Last Updated: Oct 10  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Filter by Category: [All ▼] [Show Only Gaps]          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Technical Skills                                │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  React                                           │   │
│  │  Current Required: Advanced | Your Level: Advanced ✓│
│  │  Next Position Required: Advanced ✓              │   │
│  │  ○ Beginner  ○ Intermediate  ● Advanced  ○ Expert│   │
│  │                                                  │   │
│  │  TypeScript                                      │   │
│  │  Current Required: Advanced | Your Level: Advanced ✓│
│  │  Next Position Required: Advanced ✓              │   │
│  │  ○ Beginner  ○ Intermediate  ● Advanced  ○ Expert│   │
│  │                                                  │   │
│  │  System Design                                   │   │
│  │  Current Required: Advanced | Your Level: Intermediate ⚠│
│  │  Next Position Required: Advanced ⚠              │   │
│  │  ○ Beginner  ● Intermediate  ○ Advanced  ○ Expert│   │
│  │  💡 Gap: Need to improve by 1 level for current position│
│  │     [Create Goal for This Skill]                 │   │
│  │                                                  │   │
│  │  Architecture                                    │   │
│  │  Current Required: Intermediate | Your Level: Beginner ⚠│
│  │  Next Position Required: Advanced ⚠⚠             │   │
│  │  ● Beginner  ○ Intermediate  ○ Advanced  ○ Expert│   │
│  │  💡 Gap: 1 level for current, 2 levels for next position│
│  │     [Create Goal for This Skill]                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Leadership Skills                               │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Mentoring                                       │   │
│  │  Current Required: Intermediate | Your Level: Beginner ⚠│
│  │  Next Position Required: Advanced ⚠⚠             │   │
│  │  ● Beginner  ○ Intermediate  ○ Advanced  ○ Expert│   │
│  │  💡 Gap: 1 level for current, 2 levels for next position│
│  │     [Create Goal for This Skill]                 │   │
│  │                                                  │   │
│  │  Technical Leadership                            │   │
│  │  Current Required: Not Required | Your Level: N/A│
│  │  Next Position Required: Intermediate ⚠⚠         │   │
│  │  ○ Beginner  ○ Intermediate  ○ Advanced  ○ Expert│   │
│  │  💡 Required for next position only              │   │
│  │     [Create Goal for This Skill]                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Summary                                         │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Current Position Readiness: 75% (3 gaps)       │   │
│  │  Next Position Readiness: 45% (7 gaps)          │   │
│  │                                                  │   │
│  │  [View Position Comparison] [Set Target Position]│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                              [Save Assessment]          │
└─────────────────────────────────────────────────────────┘
```

### 7. Career Map Page (Browse Organization Career Paths)

```
┌─────────────────────────────────────────────────────────┐
│  Career Map > Browse Career Paths                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┬────────────────────────────────────┐ │
│  │              │                                    │ │
│  │ Career Paths │  Engineering                       │ │
│  │              │                                    │ │
│  │ > Engineering│  ┌──────────────────────────────┐  │ │
│  │   Finance    │  │ Career Tracks                │  │ │
│  │   Product    │  ├──────────────────────────────┤  │ │
│  │   Design     │  │ ▸ Backend Engineering        │  │ │
│  │   Marketing  │  │ ▾ Frontend Engineering       │  │ │
│  │              │  │   Positions:                 │  │ │
│  │              │  │   • Junior Frontend Engineer │  │ │
│  │              │  │   • Frontend Engineer        │  │ │
│  │              │  │   • Senior Frontend Engineer │  │ │
│  │              │  │   • Staff Frontend Engineer  │  │ │
│  │              │  │   • Principal Engineer       │  │ │
│  │              │  │ ▸ DevOps Engineering         │  │ │
│  │              │  │ ▸ Security Engineering       │  │ │
│  │              │  └──────────────────────────────┘  │ │
│  │              │                                    │ │
│  └──────────────┴────────────────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Position Details: Staff Frontend Engineer      │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Level: IC5 | Salary Range: $150k-$200k         │   │
│  │  Typical Tenure: 4-6 years                      │   │
│  │                                                  │   │
│  │  Description: Technical leader and subject      │   │
│  │  matter expert. Drives architectural decisions  │   │
│  │  and mentors senior engineers.                  │   │
│  │                                                  │   │
│  │  Expectations:                                   │   │
│  │  • Lead complex technical initiatives           │   │
│  │  • Define technical strategy for team           │   │
│  │  • Mentor senior engineers                      │   │
│  │  • Drive technical excellence                   │   │
│  │                                                  │   │
│  │  Required Skills (15):                          │   │
│  │  Technical Skills:                               │   │
│  │  • React (Advanced)                              │   │
│  │  • TypeScript (Advanced)                         │   │
│  │  • System Design (Advanced)                      │   │
│  │  • Architecture (Advanced)                       │   │
│  │  • Performance Optimization (Advanced)           │   │
│  │                                                  │   │
│  │  Leadership Skills:                              │   │
│  │  • Technical Leadership (Intermediate)           │   │
│  │  • Mentoring (Advanced)                          │   │
│  │  • Code Review (Advanced)                        │   │
│  │                                                  │   │
│  │  Career Progression:                             │   │
│  │  Previous: Senior Frontend Engineer             │   │
│  │  Next: Principal Engineer                        │   │
│  │                                                  │   │
│  │  [Compare to My Skills] [Set as Target Position]│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 7. Career Map Self-Assessment Page

```
┌─────────────────────────────────────────────────────────┐
│  Career Map > My Skills Assessment          [Save]      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  My Current Position: Senior Frontend Engineer  │   │
│  │  Skills Assessed: 15/20 | Last Updated: Oct 10  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Filter by Category: [All ▼] [Show Only Gaps]          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Technical Skills                                │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  React                                           │   │
│  │  Required: Advanced | Your Level: Advanced ✓     │   │
│  │  ○ Beginner  ○ Intermediate  ● Advanced  ○ Expert│   │
│  │                                                  │   │
│  │  TypeScript                                      │   │
│  │  Required: Advanced | Your Level: Advanced ✓     │   │
│  │  ○ Beginner  ○ Intermediate  ● Advanced  ○ Expert│   │
│  │                                                  │   │
│  │  System Design                                   │   │
│  │  Required: Advanced | Your Level: Intermediate ⚠ │   │
│  │  ○ Beginner  ● Intermediate  ○ Advanced  ○ Expert│   │
│  │  💡 Gap: Need to improve by 1 level              │   │
│  │     [Create Goal for This Skill]                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Leadership Skills                               │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Mentoring                                       │   │
│  │  Required: Intermediate | Your Level: Beginner ⚠ │   │
│  │  ● Beginner  ○ Intermediate  ○ Advanced  ○ Expert│   │
│  │  💡 Gap: Need to improve by 1 level              │   │
│  │     [Create Goal for This Skill]                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                              [Save Assessment]          │
└─────────────────────────────────────────────────────────┘
```

### 8. Feedback Received Page

```
┌─────────────────────────────────────────────────────────┐
│  Feedback > Received           [Request Feedback]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tabs: [Received] [Requests]                           │
│                                                         │
│  Filters: [All Goals ▼] [Date Range ▼] [Rating ▼] [🔍] │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Summary                                         │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Total: 12 | Average Rating: ⭐⭐⭐⭐☆ 4.2        │   │
│  │  This Month: 3 | This Quarter: 8                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ⭐⭐⭐⭐⭐ Peter Morrison (Oct 10, 2025)          │   │
│  │  Goal: Improve API Design Skills                │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  "Eve has shown exceptional growth in API       │   │
│  │   design. Her recent work on the user service   │   │
│  │   demonstrated strong understanding of REST     │   │
│  │   principles and best practices..."             │   │
│  │                                                  │   │
│  │  [View Goal] [Reply] [🔗 Share]                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ⭐⭐⭐⭐☆ Diana Prince (Oct 5, 2025)             │   │
│  │  Goal: Mentor Junior Developers                 │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  "Great mentoring sessions! Eve is patient and  │   │
│  │   provides clear explanations. Would benefit    │   │
│  │   from more structured approach..."             │   │
│  │                                                  │   │
│  │  [View Goal] [Reply] [🔗 Share]                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Load More]                                            │
└─────────────────────────────────────────────────────────┘
```

### 8b. Feedback Requests Page

```
┌─────────────────────────────────────────────────────────┐
│  Feedback > Requests                    [New Request]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tabs: [Received] [Requests]                           │
│                                                         │
│  Filters: [All Status ▼] [Date Range ▼] [🔍]           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Pending Requests (3)                            │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │ From: Peter Morrison (Manager)             │ │   │
│  │  │ Goal: Improve API Design Skills            │ │   │
│  │  │ Requested: Oct 8, 2025                     │ │   │
│  │  │ Deadline: Oct 20, 2025                     │ │   │
│  │  │ [Provide Feedback]                         │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  │  ┌────────────────────────────────────────────┐ │   │
│  │  │ From: Diana Prince (Teammate)              │ │   │
│  │  │ Goal: Frontend Architecture                │ │   │
│  │  │ Requested: Oct 10, 2025                    │ │   │
│  │  │ Deadline: Oct 25, 2025                     │ │   │
│  │  │ [Provide Feedback]                         │ │   │
│  │  └────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Completed Requests (8)                          │   │
│  │  [Expand/Collapse]                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9. Feedback Request Form

```
┌─────────────────────────────────────────────────────────┐
│  Feedback > Request Feedback                 [Cancel]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Request Feedback                                 │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  Select Goal *                                    │ │
│  │  [Improve API Design Skills ▼]                    │ │
│  │                                                   │ │
│  │  Request Feedback From *                          │ │
│  │  [                              ] [🔍]            │ │
│  │                                                   │ │
│  │  Selected People (3):                             │ │
│  │  ┌──────────────────────────────────────┐        │ │
│  │  │ ☑ Peter Morrison (Manager)       [✕] │        │ │
│  │  │ ☑ Diana Prince (Teammate)        [✕] │        │ │
│  │  │ ☑ Yale Bennett (Teammate)        [✕] │        │ │
│  │  └──────────────────────────────────────┘        │ │
│  │                                                   │ │
│  │  Message (Optional)                               │ │
│  │  [                                  ]             │ │
│  │  [                                  ]             │ │
│  │                                                   │ │
│  │  Deadline (Optional)                              │ │
│  │  [MM/DD/YYYY 📅]                                  │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                    [Send Requests] [Cancel]             │
└─────────────────────────────────────────────────────────┘
```

### 10. Feedback Submit Form

```
┌─────────────────────────────────────────────────────────┐
│  Feedback > Submit Feedback                  [Cancel]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Provide Feedback                                 │ │
│  ├───────────────────────────────────────────────────┤ │
│  │  For: Eve Adams                                   │ │
│  │  Goal: Improve API Design Skills                  │ │
│  │                                                   │ │
│  │  Rating *                                         │ │
│  │  ☆ ☆ ☆ ☆ ☆  (1-5 stars)                          │ │
│  │                                                   │ │
│  │  Feedback *                                       │ │
│  │  [                                  ]             │ │
│  │  [                                  ]             │ │
│  │  [                                  ]             │ │
│  │  [                                  ]             │ │
│  │                                                   │ │
│  │  💡 Tips for constructive feedback:               │ │
│  │  • Be specific and provide examples               │ │
│  │  • Focus on behaviors, not personality            │ │
│  │  • Balance positive and constructive points       │ │
│  │  • Suggest actionable improvements                │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                    [Submit Feedback] [Cancel]           │
└─────────────────────────────────────────────────────────┘
```

### 11. Team Overview Dashboard (Manager - Peter Morrison)

```
┌─────────────────────────────────────────────────────────┐
│  Team > Team Dashboard                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │
│  │ Team Size: 3  │  │  Active Goals │  │  Avg Rating│  │
│  │ Direct Reports│  │      18       │  │  ⭐⭐⭐⭐☆   │  │
│  └───────────────┘  └───────────────┘  └────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Team Members                                    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │ Diana Prince - Staff Frontend Engineer  │   │   │
│  │  │ Goals: 6 active | Skills: 18/20 assessed│   │   │
│  │  │ Last 1:1: Oct 8 | Next: Oct 22          │   │   │
│  │  │ [View Profile] [View Goals] [Schedule 1:1]│  │   │
│  │  └──────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │ Eve Adams - Senior Frontend Engineer    │   │   │
│  │  │ Goals: 4 active | Skills: 15/20 assessed│   │   │
│  │  │ Last 1:1: Oct 10 | Next: Oct 24         │   │   │
│  │  │ [View Profile] [View Goals] [Schedule 1:1]│  │   │
│  │  └──────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │ Yale Bennett - Frontend Engineer         │   │   │
│  │  │ Goals: 8 active | Skills: 12/18 assessed│   │   │
│  │  │ Last 1:1: Oct 12 | Next: Oct 26         │   │   │
│  │  │ [View Profile] [View Goals] [Schedule 1:1]│  │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Team Skills Matrix                              │   │
│  ├─────────────────────────────────────────────────┤   │
│  │             React  TypeScript  Node  Leadership │   │
│  │  Diana P.    ████   ████       ███   ███        │   │
│  │  Eve A.      ████   ████       ██    ██         │   │
│  │  Yale B.     ███    ███        ██    █          │   │
│  │                                                  │   │
│  │  [View Full Matrix] [Export Report]             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 11b. Team Member Detail View (Manager viewing Diana Prince)

```
┌─────────────────────────────────────────────────────────┐
│  Team > Diana Prince                    [← Back to Team]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Diana Prince - Staff Frontend Engineer          │ │
│  │  Email: diana.prince@company.com                  │ │
│  │  Hire Date: Jan 2020 | Reports to: Peter Morrison│ │
│  ├───────────────────────────────────────────────────┤ │
│  │  [Schedule 1:1] [View Full Profile]              │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │
│  │ Active Goals  │  │   Feedback    │  │  Skills    │  │
│  │      6        │  │   Avg: 4.8    │  │  18/20     │  │
│  └───────────────┘  └───────────────┘  └────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Active Goals by Category                        │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Technical Skills (3)                            │   │
│  │  • Master GraphQL Architecture (80% complete)    │   │
│  │  • Improve System Design (60% complete)          │   │
│  │                                                  │   │
│  │  Leadership (2)                                  │   │
│  │  • Lead Frontend Guild (40% complete)            │   │
│  │  • Mentor 2 Junior Engineers (70% complete)      │   │
│  │                                                  │   │
│  │  [View All Goals] [Suggest New Goal]            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Skills Assessment                               │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  ✓ React (Expert) | ✓ TypeScript (Advanced)     │   │
│  │  ⚠ System Design (Intermediate - target: Adv)   │   │
│  │                                                  │   │
│  │  [View Full Assessment] [Compare to Position]   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 12. Taxonomy Management (Administrator Only)

```
┌─────────────────────────────────────────────────────────┐
│  Taxonomy > Manage Organization Structure               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tabs: [Career Paths] [Tracks] [Positions] [Skills]    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Career Paths                   [+ New Path]     │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Search: [____________] [🔍]                     │   │
│  │                                                  │   │
│  │  MUI DataGrid:                                   │   │
│  │  ┌────────────────┬──────────────┬──────────┐   │   │
│  │  │ Title          │ Description  │ Actions  │   │   │
│  │  ├────────────────┼──────────────┼──────────┤   │   │
│  │  │ Engineering    │ Tech roles   │ ✏️ 🗑️    │   │   │
│  │  │ Finance        │ Finance...   │ ✏️ 🗑️    │   │   │
│  │  │ Product        │ Product...   │ ✏️ 🗑️    │   │   │
│  │  │ Design         │ Design...    │ ✏️ 🗑️    │   │   │
│  │  └────────────────┴──────────────┴──────────┘   │   │
│  │                                                  │   │
│  │  Pagination: [< 1 2 3 >]                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Component Composition Examples

### GoalCard Component

```tsx
<GoalCard
  goal={{
    id: 'uuid',
    title: 'Improve API Design Skills',
    description: 'Master RESTful API design...',
    progress: 60,
    status: 'in_progress',
    deadline: '2025-11-30',
    skillName: 'Backend Development',
    targetLevel: 'Senior'
  }}
  onEdit={handleEdit}
  onArchive={handleArchive}
  onViewDetails={handleViewDetails}
/>

Renders:
┌────────────────────────────────────────┐
│ Improve API Design Skills              │
│ ████████████░░░░░░  60%                │
│ Skill: Backend Development → Senior    │
│ Due: Nov 30, 2025 | 3 tasks            │
│ [View Details] [Edit] [Archive]        │
└────────────────────────────────────────┘
```

### FeedbackCard Component

```tsx
<FeedbackCard
  feedback={{
    id: 'uuid',
    fromName: 'Peter Morrison',
    fromRole: 'Manager',
    rating: 5,
    content: 'Eve has shown exceptional growth...',
    goalTitle: 'Improve API Design Skills',
    createdAt: '2025-10-10'
  }}
  onReply={handleReply}
/>

Renders:
┌─────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐ Peter Morrison (Oct 10, 2025) │
│ Goal: Improve API Design Skills         │
├─────────────────────────────────────────┤
│ "Eve has shown exceptional growth in    │
│  API design. Her recent work..."        │
│                                         │
│ [View Goal] [Reply] [🔗 Share]          │
└─────────────────────────────────────────┘
```

### SkillAssessmentRow Component

```tsx
<SkillAssessmentRow
  skill={{
    id: 'uuid',
    name: 'React',
    category: 'Technical',
    requiredLevel: 'Advanced',
    currentLevel: 'Advanced'
  }}
  onLevelChange={handleLevelChange}
/>

Renders:
┌─────────────────────────────────────────┐
│ React                                   │
│ Required: Advanced | Your: Advanced ✓   │
│ ○ Beginner ○ Intermediate ● Advanced ○ Expert
└─────────────────────────────────────────┘
```

---

## Responsive Design Breakpoints

```
Mobile (xs):  < 600px   - Single column, drawer menu
Tablet (sm):  600-900px - 2 columns, drawer menu
Laptop (md):  900-1200px - 3 columns, persistent drawer
Desktop (lg): 1200-1536px - Full layout
XL (xl):      > 1536px  - Wide layout
```

---

## Color Palette (MUI Default)

### Light Mode
- Primary: Blue (#1976d2)
- Secondary: Purple (#9c27b0)
- Success: Green (#2e7d32)
- Warning: Orange (#ed6c02)
- Error: Red (#d32f2f)
- Info: Cyan (#0288d1)
- Background: White (#ffffff)
- Paper: Light Gray (#f5f5f5)

### Dark Mode
- Primary: Light Blue (#90caf9)
- Secondary: Light Purple (#ce93d8)
- Success: Light Green (#66bb6a)
- Warning: Light Orange (#ffa726)
- Error: Light Red (#f44336)
- Info: Light Cyan (#29b6f6)
- Background: Dark Gray (#121212)
- Paper: Slightly Lighter Gray (#1e1e1e)

---

## Navigation Menu Structure

### Employee View
```
📊 Dashboard

📋 Goals (collapsible)
   ▾ Technical Skills
   ▾ Leadership
   ▾ Business Skills
   ▾ Soft Skills
   ▾ Domain Specific
   
💬 Feedback (collapsible)
   ▾ Received
   ▾ Requests

📁 Projects

🎯 Skills

🗺️ Career Map
```

### Manager View (additional menu items)
```
📊 Dashboard

📋 Goals (collapsible)
   ▾ Technical Skills
   ▾ Leadership
   ▾ Business Skills
   ▾ Soft Skills
   ▾ Domain Specific

💬 Feedback (collapsible)
   ▾ Received
   ▾ Requests

📁 Projects

🎯 Skills

🗺️ Career Map

👥 Team (collapsible - shows direct reports)
   ▾ Diana Prince
   ▾ Eve Adams
   ▾ Yale Bennett
```

### Administrator View (additional menu items)
```
📊 Dashboard

📋 Goals (collapsible)
   ▾ Technical Skills
   ▾ Leadership
   ▾ Business Skills
   ▾ Soft Skills
   ▾ Domain Specific

💬 Feedback (collapsible)
   ▾ Received
   ▾ Requests

📁 Projects

🎯 Skills

🗺️ Career Map

👥 Team (collapsible - shows direct reports)
   ▾ [Employee Names]

🏛️ Taxonomy (collapsible)
   ▾ Career Paths
   ▾ Tracks
   ▾ Positions
   ▾ Skills Management
```

### Navigation Behavior Notes:
- **Goals by Skill Category**: When clicking a skill category (e.g., "Technical Skills"), navigate to Goals page filtered by that category
- **Skills**: Personal skills self-assessment page - review your current skill levels and identify gaps to reach next position
- **Career Map**: Organizational career paths browser - explore available career paths, tracks, and position requirements across the organization
- **Team Member Names**: When clicking an employee name, navigate to that employee's profile/overview page
- **Feedback Sections**: "Received" shows feedback you've received, "Requests" shows pending feedback requests
- **Collapsible Menus**: Top-level items with ▾ are expandable/collapsible
- **Role-Based**: Team menu only visible to People Managers, Taxonomy only to Administrators
```
📊 Dashboard

📋 Goals (collapsible)
   ▾ Technical Skills
   ▾ Leadership
   ▾ Business Skills
   ▾ Soft Skills
   ▾ Domain Specific
   
💬 Feedback (collapsible)
   ▾ Received
   ▾ Requests

📁 Projects

🗺️ Career Map
```

### Manager View (additional menu items)
```
📊 Dashboard

� Goals (collapsible)
   ▾ Technical Skills
   ▾ Leadership
   ▾ Business Skills
   ▾ Soft Skills
   ▾ Domain Specific

💬 Feedback (collapsible)
   ▾ Received
   ▾ Requests

📁 Projects

🗺️ Career Map

👥 Team (collapsible - shows direct reports)
   ▾ Diana Prince
   ▾ Eve Adams
   ▾ Yale Bennett
```

### Administrator View (additional menu items)
```
📊 Dashboard

📋 Goals (collapsible)
   ▾ Technical Skills
   ▾ Leadership
   ▾ Business Skills
   ▾ Soft Skills
   ▾ Domain Specific

� Feedback (collapsible)
   ▾ Received
   ▾ Requests

📁 Projects

🗺️ Career Map

👥 Team (collapsible - shows direct reports)
   ▾ [Employee Names]

🏛️ Taxonomy (collapsible)
   ▾ Career Paths
   ▾ Tracks
   ▾ Positions
   ▾ Skills Management
```

### Navigation Behavior Notes:
- **Goals by Skill Category**: When clicking a skill category (e.g., "Technical Skills"), navigate to Goals page filtered by that category
- **Team Member Names**: When clicking an employee name, navigate to that employee's profile/overview page
- **Feedback Sections**: "Received" shows feedback you've received, "Requests" shows pending feedback requests
- **Collapsible Menus**: Top-level items with ▾ are expandable/collapsible
- **Role-Based**: Team menu only visible to People Managers, Taxonomy only to Administrators

---

## Key User Flows

### 1. Create Goal Flow
```
Dashboard → Goals → [+ New Goal] → Fill Form → [Save] → Goal Detail Page
```

### 2. Request Feedback Flow
```
Dashboard → Goals → Goal Detail → [Request Feedback] → Select People → [Send] → Confirmation
```

### 3. Submit Feedback Flow
```
Dashboard → Feedback → Requests → Select Request → Fill Form → [Submit] → Confirmation
```

### 4. Create Project Flow
```
Dashboard → Projects → [+ New Project] → Fill Form → Link Goals → [Save] → Project Detail Page
```

### 5. Self-Assessment Flow
```
Dashboard → Skills → My Assessment → Rate Skills → [Save] → View Gaps → [Create Goals]
```

### 6. Explore Career Path Flow
```
Dashboard → Career Map → Browse Paths → Select Position → View Requirements → [Compare to My Skills] → [Set as Target Position]
```

### 7. Manager Review Team Member Flow
```
Dashboard → Team (opens Team Dashboard) → Click Employee in Sidebar (e.g., Diana Prince) → View Employee Dashboard → View Goals by Category → View Feedback → Suggest Goal
```

### 8. Employee Browse Goals by Category Flow
```
Dashboard → Goals Sidebar → Click Category (e.g., Technical Skills) → View Filtered Goals → Create New Goal
```

### 9. Admin Manage Taxonomy Flow
```
Dashboard → Taxonomy → Select Entity Type → Create/Edit/Delete → [Save] → Updated List
```

---

This component hierarchy document will guide the implementation. Ready to start building! 🎨
