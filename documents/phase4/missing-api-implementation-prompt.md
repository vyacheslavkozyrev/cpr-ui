# Missing API Implementation Prompt

## Overview

This prompt provides comprehensive specifications for implementing the missing Goals Management API endpoints in the CPR (Continuous Performance Reviews) system. The implementation should follow existing patterns from the current API structure and maintain consistency with established conventions.

## Project Context

- **Framework**: ASP.NET Core Web API
- **Database**: PostgreSQL with Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **Authorization**: Role-based access control (Employee, People Manager, Solution Owner, Director, Administrator)
- **API Documentation**: Swagger/OpenAPI integration
- **Base URL**: `http://localhost:5000/api`

## Missing API Endpoints

### 1. DELETE Task from Goal

**Endpoint**: `DELETE /api/Goals/{id}/tasks/{taskId}`

**Purpose**: Remove a task from a goal (soft delete recommended)

**Access Control**:

- Goal owner (employee who created the goal)
- People Manager or higher roles
- Administrator

**Implementation Requirements**:

```csharp
[HttpDelete("{id}/tasks/{taskId}")]
[Authorize]
public async Task<IActionResult> DeleteGoalTask(Guid id, Guid taskId)
{
    // 1. Validate parameters
    if (id == Guid.Empty || taskId == Guid.Empty)
    {
        return BadRequest("Invalid goal ID or task ID");
    }

    // 2. Get current user information
    var currentUserId = GetCurrentUserId(); // From base controller
    var currentUser = await _userService.GetUserByIdAsync(currentUserId);

    // 3. Verify goal exists and user has access
    var goal = await _goalService.GetGoalByIdAsync(id);
    if (goal == null)
    {
        return NotFound($"Goal with ID {id} not found");
    }

    // 4. Check authorization (goal owner, manager+, or admin)
    if (!CanUserModifyGoal(currentUser, goal))
    {
        return Forbid("Insufficient permissions to modify this goal");
    }

    // 5. Verify task exists and belongs to the goal
    var task = await _goalTaskService.GetTaskByIdAsync(taskId);
    if (task == null || task.GoalId != id)
    {
        return NotFound($"Task with ID {taskId} not found in goal {id}");
    }

    // 6. Soft delete the task
    await _goalTaskService.DeleteTaskAsync(taskId);

    // 7. Update goal's updated_at timestamp
    await _goalService.UpdateGoalTimestampAsync(id);

    return NoContent(); // 204 No Content
}
```

**Service Layer Implementation**:

```csharp
// IGoalTaskService interface
public interface IGoalTaskService
{
    Task<GoalTaskDto> GetTaskByIdAsync(Guid taskId);
    Task DeleteTaskAsync(Guid taskId);
    // ... other existing methods
}

// GoalTaskService implementation
public async Task DeleteTaskAsync(Guid taskId)
{
    var task = await _context.GoalTasks
        .FirstOrDefaultAsync(t => t.Id == taskId && !t.IsDeleted);

    if (task != null)
    {
        task.IsDeleted = true;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
```

**Error Handling**:

- **400 Bad Request**: Invalid UUID format for parameters
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User lacks permission to modify this goal
- **404 Not Found**: Goal or task not found
- **204 No Content**: Successful deletion

**Database Considerations**:

- Use soft delete (`is_deleted = true`) to maintain data integrity
- Update `updated_at` timestamps on both task and parent goal
- Ensure CASCADE relationships are properly handled

## Additional API Enhancements (Optional)

### 2. Bulk Operations Support

**Endpoint**: `POST /api/Goals/{id}/tasks/bulk-delete`

```csharp
[HttpPost("{id}/tasks/bulk-delete")]
public async Task<IActionResult> BulkDeleteTasks(Guid id, [FromBody] BulkDeleteTasksDto dto)
{
    // Validate all task IDs belong to the goal
    // Check permissions once for the goal
    // Perform bulk soft delete operation
    // Return summary of deleted tasks
}
```

### 3. Task History/Audit Trail

**Endpoint**: `GET /api/Goals/{id}/tasks/{taskId}/history`

- Track changes to tasks for audit purposes
- Useful for performance review discussions

## Implementation Guidelines

### 1. Follow Existing Patterns

- **Controller Structure**: Inherit from existing base controller
- **Service Injection**: Use dependency injection pattern established in other controllers
- **Error Responses**: Follow existing error response format
- **Logging**: Use structured logging with correlation IDs

### 2. Security Considerations

```csharp
private bool CanUserModifyGoal(UserDto user, GoalDto goal)
{
    // Goal owner can always modify
    if (goal.EmployeeId == user.Id)
        return true;

    // People Manager or higher can modify team member goals
    if (user.Role.Level >= RoleLevel.PeopleManager)
    {
        // Additional logic to verify reporting relationship
        return IsUserManagerOf(user.Id, goal.EmployeeId);
    }

    // Administrators have full access
    return user.Role.Name == "Administrator";
}
```

### 3. Data Validation

```csharp
// Add data annotations to DTOs
public class BulkDeleteTasksDto
{
    [Required]
    [MinLength(1, ErrorMessage = "At least one task ID is required")]
    public List<Guid> TaskIds { get; set; } = new();
}
```

### 4. Testing Requirements

**Unit Tests**:

```csharp
[Test]
public async Task DeleteGoalTask_ValidRequest_ReturnsNoContent()
{
    // Arrange: Setup goal, task, and user with proper permissions
    // Act: Call delete endpoint
    // Assert: Verify 204 response and task is soft deleted
}

[Test]
public async Task DeleteGoalTask_TaskNotFound_ReturnsNotFound()
{
    // Test error scenarios
}
```

**Integration Tests**:

- Test full HTTP request/response cycle
- Verify database changes
- Test authorization scenarios

### 5. Performance Considerations

- **Database Queries**: Use efficient queries with proper indexing
- **Caching**: Consider caching for frequently accessed goal data
- **Pagination**: Ensure task lists are properly paginated for large goals

## Database Migrations

```sql
-- If any schema changes are needed
ALTER TABLE goal_tasks ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);
ALTER TABLE goal_tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_tasks_goal_id_not_deleted
ON goal_tasks(goal_id) WHERE is_deleted = false;
```

## API Documentation Updates

Update Swagger documentation with:

```csharp
/// <summary>
/// Delete a task from a goal
/// </summary>
/// <param name="id">Goal identifier</param>
/// <param name="taskId">Task identifier</param>
/// <returns>No content on successful deletion</returns>
/// <response code="204">Task successfully deleted</response>
/// <response code="400">Invalid request parameters</response>
/// <response code="401">Authentication required</response>
/// <response code="403">Insufficient permissions</response>
/// <response code="404">Goal or task not found</response>
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
```

## Frontend Integration Notes

The frontend React application expects:

1. **Status Codes**:
   - 204 for successful deletion
   - Standard error codes for failures

2. **Response Format**:
   - No body for successful deletion
   - Standard error format for failures

3. **State Management**:
   - Zustand store will handle optimistic updates
   - React Query will manage cache invalidation

## Testing Strategy

1. **Unit Tests**: 50+ tests covering all scenarios
2. **Integration Tests**: Full request/response cycle testing
3. **Authorization Tests**: Verify role-based access control
4. **Performance Tests**: Load testing for bulk operations

## Deployment Checklist

- [ ] Implement DELETE endpoint with proper authorization
- [ ] Add comprehensive unit tests (80%+ coverage)
- [ ] Update API documentation (Swagger)
- [ ] Run integration tests against test database
- [ ] Verify error handling for all scenarios
- [ ] Test authorization matrix for different user roles
- [ ] Performance test with large datasets
- [ ] Update frontend API service layer to use new endpoint

## Success Criteria

✅ **Functional Requirements**:

- DELETE /api/Goals/{id}/tasks/{taskId} returns 204 on success
- Proper authorization checks implemented
- Soft delete maintains data integrity
- Parent goal timestamp updated on task deletion

✅ **Non-Functional Requirements**:

- Response time < 200ms for single task deletion
- 95%+ uptime for API endpoint
- Comprehensive error handling and logging
- Security vulnerabilities addressed

✅ **Quality Gates**:

- Unit test coverage > 80%
- Integration tests pass
- API documentation updated
- Code review approved
- Performance benchmarks met

This implementation will complete the Goals Management API and enable full CRUD operations for the Phase 4 frontend implementation.
