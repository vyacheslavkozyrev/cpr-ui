# API Endpoints - Phase 4 Goals Management

## Base URL

`http://localhost:5000/api`

## Authentication

All endpoints require Bearer JWT authentication via `Authorization: Bearer {token}` header.

## Goals Endpoints

### 1. Create Goal

**POST** `/Goals`

- **Purpose**: Create a new goal for the authenticated user
- **Access**: Any authenticated user
- **Request Body**: `CreateGoalDto`
- **Response**: 201 Created with goal object
- **Validation**: Title required (1-250 chars), Description max 2000 chars

### 2. Get User Goals (Paginated)

**GET** `/me/goals`

- **Purpose**: Get paginated list of current user's goals
- **Access**: Any authenticated user
- **Query Parameters**:
  - `page` (int32, default: 1) - Page number
  - `per_page` (int32, default: 20) - Items per page
- **Response**: 200 OK with paginated goal list

### 3. Get Goal by ID

**GET** `/Goals/{id}`

- **Purpose**: Get specific goal with tasks and metadata
- **Access**: Goal owner, People Manager+, Administrator
- **Parameters**:
  - `id` (uuid, required) - Goal identifier
- **Response**: 200 OK with complete goal object including tasks

### 4. Update Goal

**PATCH** `/Goals/{id}`

- **Purpose**: Partially update goal properties
- **Access**: Goal owner, People Manager+
- **Parameters**:
  - `id` (uuid, required) - Goal identifier
- **Request Body**: `UpdateGoalDto`
- **Response**: 200 OK with updated goal object

### 5. Delete Goal

**DELETE** `/Goals/{id}`

- **Purpose**: Soft delete a goal
- **Access**: Goal owner, Administrator
- **Parameters**:
  - `id` (uuid, required) - Goal identifier
- **Response**: 200 OK

## Goal Tasks Endpoints

### 1. Add Task to Goal

**POST** `/Goals/{id}/tasks`

- **Purpose**: Add a new task under existing goal
- **Access**: Goal owner, People Manager+
- **Parameters**:
  - `id` (uuid, required) - Goal identifier
- **Request Body**: `CreateGoalTaskDto`
- **Response**: 200 OK with created task object

### 2. Update Task

**PATCH** `/Goals/{id}/tasks/{taskId}`

- **Purpose**: Update task properties including completion status
- **Access**: Goal owner, People Manager+
- **Parameters**:
  - `id` (uuid, required) - Goal identifier
  - `taskId` (uuid, required) - Task identifier
- **Request Body**: `UpdateGoalTaskDto`
- **Response**: 200 OK with updated task object

### 3. Delete Task (Missing - To be implemented)

**DELETE** `/Goals/{id}/tasks/{taskId}`

- **Purpose**: Delete a task from goal
- **Access**: Goal owner, People Manager+
- **Parameters**:
  - `id` (uuid, required) - Goal identifier
  - `taskId` (uuid, required) - Task identifier
- **Response**: 204 No Content
- **Status**: ⚠️ **Missing Endpoint** - Needs backend implementation

## Dashboard Integration Endpoints

### 1. Goals Summary for Dashboard

**GET** `/dashboard/goals-summary`

- **Purpose**: Get detailed goals statistics and trends
- **Access**: Any authenticated user
- **Query Parameters**:
  - `period` (string, default: "month") - Time period: week|month|quarter|year
- **Response**: 200 OK with `GoalsSummaryDto`

## Team Management Endpoints (People Manager+)

### 1. Team Goals Overview

**GET** `/team/goals`

- **Purpose**: Get aggregated goals for all team members
- **Access**: People Manager, Solution Owner, Director, Administrator
- **Response**: 200 OK with `TeamGoalsDto`

## Error Responses

All endpoints return standardized error responses:

### 400 Bad Request

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Title": ["Title is required"],
    "Priority": ["Priority must be between 0 and 100"]
  }
}
```

### 401 Unauthorized

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.2",
  "title": "Unauthorized",
  "status": 401
}
```

### 403 Forbidden

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.3",
  "title": "Forbidden",
  "status": 403
}
```

### 404 Not Found

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404
}
```

## Rate Limiting

- No specific rate limits documented
- Standard API rate limiting applies

## Pagination Format

```json
{
  "items": [...],
  "total": 123,
  "page": 1,
  "per_page": 20
}
```

## Status Codes Summary

- **200 OK**: Successful GET, PATCH operations
- **201 Created**: Successful POST operations
- **204 No Content**: Successful DELETE operations
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
