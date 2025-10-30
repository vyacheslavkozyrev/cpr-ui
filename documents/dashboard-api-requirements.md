# Dashboard API Implementation Requirements

## 🎯 **Project Context**

We are implementing Phase 3 of the CPR (Continuous Performance Review) UI project, focusing on dashboard functionality. The frontend team needs 5 new API endpoints to support dashboard widgets that display user performance metrics, activity feeds, and summary statistics.

## 📋 **Implementation Requirements**

### **Technology Stack**

- **.NET Core API** with Entity Framework
- **JWT Bearer Authentication** (already implemented)
- **Role-Based Authorization** (RBAC system in place)
- **OpenAPI/Swagger** documentation
- **MSW mocking** support for frontend development

### **Database Context**

The following tables are already available:

- `users`, `employees`, `user_to_role` (authentication/authorization)
- `goals`, `goal_tasks` (goals management)
- `feedback`, `feedback_requests` (feedback system)
- `skills`, `employee_skills`, `skill_categories` (skills taxonomy)
- Various taxonomy tables for career paths and positions

## 🚀 **Required Endpoints**

### **1. Dashboard Summary - GET /api/dashboard/summary**

**Purpose**: Aggregate overview statistics for authenticated user's dashboard
**Authorization**: Any authenticated user
**Query Parameters**:

- `period=week|month|quarter|year` (optional, defaults to 'month')

**Response Contract**:

```json
{
  "goals": {
    "total": 12,
    "active": 8,
    "completed": 3,
    "overdue": 1,
    "completionRate": 75.0
  },
  "feedback": {
    "totalReceived": 15,
    "pendingRequests": 3,
    "averageRating": 4.2,
    "recentCount": 5
  },
  "skills": {
    "totalSkills": 20,
    "assessedSkills": 16,
    "assessmentProgress": 80.0,
    "averageLevel": 3.2
  },
  "activity": {
    "totalActivities": 25,
    "recentActivities": 8
  }
}
```

**Business Logic**:

- Filter all data by authenticated user's employee ID
- Apply period filter to date-based calculations
- Calculate completion rate as (completed / total) \* 100
- Count overdue goals where deadline < current date and status != completed

---

### **2. Activity Feed - GET /api/dashboard/activity**

**Purpose**: Recent activity timeline for authenticated user
**Authorization**: Any authenticated user
**Query Parameters**:

- `days=integer` (optional, defaults to 10, max 30) - **Configurable as requested**
- `page=integer` (optional, defaults to 1)
- `per_page=integer` (optional, defaults to 20, max 50)

**Response Contract**:

```json
{
  "items": [
    {
      "id": "GUID",
      "type": "goal_created|goal_completed|goal_updated|feedback_received|feedback_requested|skill_assessed|skill_updated",
      "title": "string - Activity title",
      "description": "string - Activity description",
      "timestamp": "DateTime - ISO8601 format",
      "metadata": {
        "goalId": "GUID (optional)",
        "feedbackId": "GUID (optional)",
        "skillId": "GUID (optional)",
        "fromUserId": "GUID (optional)",
        "rating": "integer (optional)"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "per_page": 20
}
```

**Implementation Notes**:

- **Activity Logging**: You may need to create an `activity_log` table or generate activities on-the-fly from existing data
- **Activity Types**: Map database events to activity types (goal creation, feedback received, etc.)
- **Pagination**: Standard pagination with total count
- **Date Filter**: Activities within the last N days based on `days` parameter

---

### **3. Goals Summary - GET /api/dashboard/goals-summary**

**Purpose**: Detailed goals statistics for goals dashboard widget
**Authorization**: Any authenticated user
**Query Parameters**:

- `period=week|month|quarter|year` (optional, defaults to 'month')

**Response Contract**:

```json
{
  "statistics": {
    "total": 12,
    "active": 8,
    "completed": 3,
    "overdue": 1,
    "completionRate": 75.0,
    "averageProgress": 65.5
  },
  "recentGoals": [
    {
      "id": "GUID",
      "title": "string",
      "status": "open|in_progress|completed",
      "progress": 65,
      "deadline": "DateTime (optional)",
      "isOverdue": false
    }
  ],
  "progressTrend": [
    {
      "period": "2025-10-01",
      "completed": 2,
      "created": 3
    }
  ]
}
```

**Business Logic**:

- Calculate progress as percentage of completed tasks within each goal
- Generate trend data by grouping goals by creation/completion dates within the period
- Mark goals as overdue if deadline < current date and status != completed

---

### **4. Feedback Summary - GET /api/dashboard/feedback-summary**

**Purpose**: Feedback statistics for feedback dashboard widget
**Authorization**: Any authenticated user
**Query Parameters**:

- `period=week|month|quarter|year` (optional, defaults to 'month')

**Response Contract**:

```json
{
  "statistics": {
    "totalReceived": 15,
    "pendingRequests": 3,
    "averageRating": 4.2,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 7,
      "5": 5
    }
  },
  "recentFeedback": [
    {
      "id": "GUID",
      "fromEmployeeId": "GUID",
      "fromEmployeeName": "string",
      "goalTitle": "string",
      "rating": 4,
      "createdAt": "DateTime"
    }
  ],
  "ratingTrend": [
    {
      "period": "2025-10-01",
      "averageRating": 4.1,
      "count": 3
    }
  ]
}
```

**Business Logic**:

- Count feedback where `employeeId` = authenticated user's employee ID
- Calculate rating distribution (count of each rating 1-5)
- Include employee names by joining with employees table
- Generate rating trends by period (weekly/monthly averages)

---

### **5. Skills Summary - GET /api/dashboard/skills-summary**

**Purpose**: Skills assessment overview for skills dashboard widget
**Authorization**: Any authenticated user

**Response Contract**:

```json
{
  "statistics": {
    "totalSkills": 20,
    "assessedSkills": 16,
    "assessmentProgress": 80.0,
    "averageLevel": 3.2,
    "skillGaps": 4
  },
  "skillCategories": [
    {
      "categoryId": "GUID",
      "categoryName": "Technical Skills",
      "totalSkills": 8,
      "assessedSkills": 7,
      "averageLevel": 3.5
    }
  ],
  "recentAssessments": [
    {
      "skillId": "GUID",
      "skillName": "React",
      "level": 4,
      "assessedAt": "DateTime"
    }
  ]
}
```

**Business Logic**:

- Count total available skills vs. skills assessed by user
- Calculate skill gaps as unassessed skills
- Group by skill categories with aggregated statistics
- Show most recent skill assessments (last 5-10)

---

## 🛠️ **Implementation Guidelines**

### **Authentication & Authorization**

- All endpoints require JWT Bearer authentication
- Use existing RBAC system - any authenticated user can access their own dashboard data
- Extract employee ID from authenticated user's claims/context
- Return 401 for unauthenticated requests
- Return 403 if user context cannot be resolved

### **Error Handling**

- Standard HTTP status codes (200, 400, 401, 403, 500)
- Consistent error response format matching existing API patterns
- Validate query parameters (period values, pagination limits)
- Handle database connection errors gracefully

### **Performance Considerations**

- Optimize database queries with appropriate indexes
- Consider caching for frequently accessed summary data
- Use efficient queries for aggregations (GROUP BY, COUNT, AVG)
- Limit result sets appropriately (pagination, recent items)

### **Data Validation**

- Validate period parameter: `week|month|quarter|year`
- Validate pagination: page >= 1, per_page <= 50
- Validate days parameter: 1 <= days <= 30
- Return 400 Bad Request for invalid parameters

### **Testing Requirements**

- Unit tests for all controller actions
- Integration tests for database queries
- Mock data for development/testing scenarios
- OpenAPI documentation with example responses

## 📊 **Database Queries Examples**

### **Goals Statistics Query Pattern**

```sql
-- Example pattern for goals summary
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN status != 'completed' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN deadline < GETDATE() AND status != 'completed' THEN 1 END) as overdue
FROM goals
WHERE employee_id = @userId
  AND created_at >= @periodStart
```

### **Activity Generation Strategy**

You can either:

1. **Create activity_log table** - Log activities as they happen (recommended)
2. **Generate on-the-fly** - Query recent changes from goals, feedback, skills tables

## 🎯 **Success Criteria**

- All 5 endpoints implemented and working
- Swagger documentation updated with new endpoints
- Integration tests passing
- Frontend can successfully fetch and display dashboard data
- Performance benchmarks met (< 500ms response time)
- Proper error handling and validation implemented

## 📞 **Questions & Clarifications**

If you need clarification on any business logic, data relationships, or implementation details, please ask. The frontend team is ready to integrate once these endpoints are available.

**Priority**: High - Frontend development is blocked until these endpoints are implemented.
**Timeline**: Phase 3 development (Week 4)
**Dependencies**: Existing authentication, authorization, and database schema
