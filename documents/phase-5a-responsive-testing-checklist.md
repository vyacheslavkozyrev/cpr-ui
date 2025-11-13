# Phase 5A - Responsive Testing Checklist

**Feature 0001 - Personal Goal Management**  
**Date:** November 12, 2025  
**Tester:** [Your Name]

## Testing Environment

- **Dev Server:** Running on http://localhost:5173
- **Browser:** Chrome/Firefox/Safari (DevTools)
- **Test User:** Mock user from auth

---

## Test Cases

### 1. GoalsPage - Mobile (<600px)

**Viewport:** 375px × 667px (iPhone SE)

- [ ] **Layout**
  - [ ] Page header displays correctly
  - [ ] FAB (Create Goal button) is visible in bottom-right
  - [ ] Filters panel stacks vertically
  - [ ] Search box spans full width
  - [ ] Status/Progress/Deadline filters stack vertically
  - [ ] Per-page selector and sort controls stack vertically

- [ ] **Grid View**
  - [ ] Goal cards display in single column (1 card per row)
  - [ ] Cards are full width with proper padding
  - [ ] Card content is readable (no overflow)
  - [ ] Overdue indicators visible on cards
  - [ ] Card actions (View Details) accessible

- [ ] **Table View**
  - [ ] Table scrolls horizontally if needed
  - [ ] Table headers are sortable (click to test)
  - [ ] Row content doesn't overflow
  - [ ] Action menu (⋮) accessible

- [ ] **Loading States**
  - [ ] Skeleton loaders display correctly (refresh to test)
  - [ ] Skeleton cards match real card layout

- [ ] **Empty States**
  - [ ] "No results" message displays when filters return nothing
  - [ ] "No goals yet" displays when no goals exist
  - [ ] Call-to-action buttons visible and functional

- [ ] **Pagination**
  - [ ] Pagination controls stack correctly
  - [ ] Page numbers readable and clickable
  - [ ] Previous/Next buttons functional

---

### 2. GoalsPage - Tablet (600-960px)

**Viewport:** 768px × 1024px (iPad)

- [ ] **Layout**
  - [ ] Page header with breadcrumbs
  - [ ] Filters display in 2-column layout
  - [ ] Search + Status on first row
  - [ ] Progress + Deadline on second row
  - [ ] Per-page + Sort controls on third row

- [ ] **Grid View**
  - [ ] Goal cards display in 2-column grid
  - [ ] Cards maintain consistent height
  - [ ] Proper spacing between cards
  - [ ] All card content visible without scrolling within card

- [ ] **Table View**
  - [ ] All columns visible without horizontal scroll
  - [ ] Column widths appropriate (no cramping)
  - [ ] Sortable headers functional

- [ ] **Interactions**
  - [ ] Hover effects on cards/rows work
  - [ ] Filter changes update results smoothly
  - [ ] Sort changes work correctly

---

### 3. GoalsPage - Desktop (>960px)

**Viewport:** 1920px × 1080px (Full HD)

- [ ] **Layout**
  - [ ] Full page header with navigation
  - [ ] Filters display in single row (6 controls)
  - [ ] Proper spacing and alignment
  - [ ] No excessive whitespace

- [ ] **Grid View**
  - [ ] Goal cards display in 4-column grid
  - [ ] Cards maintain consistent size
  - [ ] Grid responsive to window resize
  - [ ] Overdue indicators clear and visible

- [ ] **Table View**
  - [ ] All columns visible with comfortable spacing
  - [ ] Table doesn't stretch unnecessarily
  - [ ] Sort indicators visible and functional
  - [ ] Action menus align properly

- [ ] **Performance**
  - [ ] Smooth transitions between views
  - [ ] No layout shifts when loading data
  - [ ] Filters respond instantly

---

### 4. GoalDetailPage - Mobile (<600px)

**Viewport:** 375px × 667px (iPhone SE)

- [ ] **Layout**
  - [ ] Back button visible and functional
  - [ ] Goal title doesn't overflow
  - [ ] Status chip displays correctly
  - [ ] Description readable with proper line breaks
  - [ ] Deadline and progress info stacked vertically

- [ ] **Task List**
  - [ ] Tasks display in single column
  - [ ] Checkboxes functional
  - [ ] Task titles wrap properly
  - [ ] Deadline warnings visible
  - [ ] Add task button accessible

- [ ] **Actions**
  - [ ] Complete/Reopen button visible
  - [ ] Edit button accessible
  - [ ] Action buttons don't overlap content

---

### 5. GoalDetailPage - Tablet (600-960px)

**Viewport:** 768px × 1024px (iPad)

- [ ] **Layout**
  - [ ] Two-column layout where appropriate
  - [ ] Goal info in left section, metadata in right
  - [ ] Tasks list readable width
  - [ ] Proper spacing between sections

- [ ] **Interactions**
  - [ ] Complete/Reopen updates optimistically
  - [ ] Task checkbox toggles smoothly
  - [ ] All buttons easily tappable

---

### 6. GoalDetailPage - Desktop (>960px)

**Viewport:** 1920px × 1080px (Full HD)

- [ ] **Layout**
  - [ ] Content centered with max-width
  - [ ] Sidebar metadata displays properly
  - [ ] Tasks list doesn't stretch too wide
  - [ ] Related skills info visible

- [ ] **Interactions**
  - [ ] Hover states on tasks work
  - [ ] Action buttons have proper spacing
  - [ ] No layout issues on wide screens

---

### 7. GoalFormPage - Mobile (<600px)

**Viewport:** 375px × 667px (iPhone SE)

- [ ] **Layout**
  - [ ] Form fields stack vertically
  - [ ] All inputs span full width
  - [ ] Labels clearly visible
  - [ ] Save button accessible

- [ ] **Validation**
  - [ ] Real-time validation shows errors after 500ms
  - [ ] Error messages display below fields
  - [ ] Errors clear when user corrects input
  - [ ] Title validation: required, max 250 chars
  - [ ] Description validation: max 2000 chars
  - [ ] Deadline validation: must be future date
  - [ ] Priority validation: 0-100 range

- [ ] **Unsaved Changes**
  - [ ] Warning appears when navigating away with unsaved changes
  - [ ] Browser "beforeunload" warning on page refresh
  - [ ] isDirty tracking works correctly

- [ ] **Interactions**
  - [ ] Keyboard opens properly for text inputs
  - [ ] Date picker functional
  - [ ] Select dropdowns accessible

---

### 8. GoalFormPage - Tablet (600-960px)

**Viewport:** 768px × 1024px (iPad)

- [ ] **Layout**
  - [ ] Form fields in comfortable widths
  - [ ] Two-column layout for related fields where appropriate
  - [ ] Validation errors visible
  - [ ] Proper spacing between fields

- [ ] **Validation**
  - [ ] Inline validation appears as user types (debounced)
  - [ ] Error messages don't break layout
  - [ ] Field borders highlight on error

---

### 9. GoalFormPage - Desktop (>960px)

**Viewport:** 1920px × 1080px (Full HD)

- [ ] **Layout**
  - [ ] Form contained to readable width (not stretching)
  - [ ] Fields properly aligned
  - [ ] Action buttons right-aligned
  - [ ] Breadcrumbs visible

- [ ] **Validation**
  - [ ] Real-time validation smooth and responsive
  - [ ] Focus states clear
  - [ ] Error messages positioned correctly

- [ ] **Performance**
  - [ ] Debounce working (no validation on every keystroke)
  - [ ] Form submits without layout issues
  - [ ] Success/error messages display properly

---

## Cross-Breakpoint Tests

### Resize Testing

- [ ] Smoothly resize browser from 375px → 1920px
- [ ] Grid columns adjust correctly (1 → 2 → 4)
- [ ] Filters reflow properly
- [ ] No broken layouts during transition
- [ ] FAB stays in position
- [ ] Table switches to horizontal scroll on mobile

### Orientation Change (Mobile/Tablet)

- [ ] Portrait → Landscape transition smooth
- [ ] Content readable in both orientations
- [ ] No horizontal overflow

### Loading States

- [ ] Skeleton loaders work at all breakpoints
- [ ] Skeletons match actual content layout
- [ ] Smooth transition from skeleton to content

---

## Issues Found

| Issue # | Component | Breakpoint | Description | Severity | Status |
| ------- | --------- | ---------- | ----------- | -------- | ------ |
| 1       |           |            |             |          |        |
| 2       |           |            |             |          |        |
| 3       |           |            |             |          |        |

**Severity:**

- **Critical:** Blocks functionality
- **High:** Major UX issue
- **Medium:** Minor layout issue
- **Low:** Polish/enhancement

---

## Testing Notes

- **Date Tested:** ******\_******
- **Browser:** ******\_******
- **Operating System:** ******\_******
- **Additional Notes:**

---

## Completion Criteria

✅ **All checkboxes marked**  
✅ **No critical or high severity issues**  
✅ **All three pages tested across all breakpoints**  
✅ **Smooth transitions between breakpoints verified**  
✅ **Loading and empty states confirmed**  
✅ **Validation (real-time + unsaved changes) working**

---

**Phase 5A Status:** Ready for sign-off once testing complete
