# Account Menu Implementation Plan

## Overview
Replace the current "Sign Out" button in the header with a comprehensive account menu dropdown that displays user information and provides access to account management features.

## Current State Analysis

### Authentication System
- **PocketBase Integration**: Uses PocketBase client (`getApiClient()`) for authentication
- **Auth State**: `client.authStore.isValid` checks authentication status
- **User Data**: `client.authStore.model` contains user information (email, id, etc.)
- **Logout Method**: `client.authStore.clear()` clears authentication

### Existing Components to Leverage
- **Dropdown Component** (`ui/src/components/Dropdown.tsx`): Feature-complete with accessibility, keyboard navigation, and click-outside handling
- **Button Component** (`ui/src/components/Button.tsx`): Well-designed with multiple variants including "ghost" 
- **Header Component** (`ui/src/components/Header.tsx`): Current location of "Sign Out" button

### Current Header Structure
```tsx
<header className="bg-background-900 border-b border-surface-700">
  <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16 gap-4">
      <a href="/">Home</a>
      <SermonSearch />
      <Button variant="ghost" onClick={logout}>Sign Out</Button> // <- Replace this
    </div>
  </nav>
</header>
```

## Implementation Plan

### Step 1: Create Account Menu Icon Component
**File**: `ui/src/components/AccountIcon.tsx`

**Purpose**: Create a reusable circular account icon button that follows the classic person-in-circle design pattern.

**Implementation Details**:
- Use inline SVG for the person icon (following existing patterns)
- Circular background with appropriate hover states
- Size: 32px (w-8 h-8) to match header height expectations
- Colors: Use theme colors for consistency
- Accessibility: Proper ARIA labels

**SVG Icon**: Use a standard user/person icon from heroicons or similar
```tsx
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
</svg>
```

### Step 2: Create Account Menu Component
**File**: `ui/src/components/AccountMenu.tsx`

**Purpose**: Wrapper component that combines the AccountIcon with the Dropdown to create the complete account menu.

**Implementation Details**:
- Import and use existing `Dropdown` component
- Use `placement="bottom-end"` for right-aligned dropdown
- Handle user data fetching from PocketBase authStore
- Implement menu items with proper onClick handlers
- Handle loading states and error scenarios

**Menu Items**:
1. **User Email Display**: Non-interactive item showing current user's email
2. **Manage Account**: Button (stub for now, will be implemented later)
3. **Divider**: Visual separator
4. **Sign Out**: Logout functionality

### Step 3: Update Header Component
**File**: `ui/src/components/Header.tsx`

**Changes**:
- Remove the current "Sign Out" button
- Import and add the new `AccountMenu` component
- Maintain the same flex layout and positioning
- Preserve the `flex-shrink-0` class for proper responsive behavior

### Step 4: Styling and Theme Integration

**Color Scheme** (following existing patterns):
- **Account Icon**: 
  - Background: `bg-surface-800 hover:bg-surface-700`
  - Icon: `text-surface-100`
  - Border: `border-surface-600`
- **Dropdown Menu**:
  - Background: `bg-white dark:bg-surface-800`
  - Border: `border-surface-300 dark:border-surface-600`
  - Text: `text-background-900 dark:text-surface-100`
- **Menu Items**:
  - Hover: `hover:bg-surface-100 dark:hover:bg-surface-700`
  - Disabled: `text-surface-500 dark:text-surface-400`

**Spacing and Layout**:
- Dropdown width: `w-56` (224px) for comfortable content
- Item padding: `px-4 py-2` following existing patterns
- Icon-to-text spacing: `gap-3` for visual balance

### Step 5: User Data Integration

**Data Sources**:
- **Email**: `client.authStore.model?.email`
- **Name**: `client.authStore.model?.name` (if available)
- **ID**: `client.authStore.model?.id`

**Error Handling**:
- Handle cases where user data is not available
- Graceful fallback to "User" or email if name is missing
- Handle authentication edge cases

### Step 6: Accessibility Implementation

**ARIA Labels**:
- Account button: `aria-label="Account menu"`
- Dropdown: `role="menu"`
- Menu items: `role="menuitem"`

**Keyboard Navigation**:
- Leverage existing Dropdown keyboard support (ESC key)
- Ensure proper focus management
- Support screen readers

## Technical Specifications

### Component Architecture
```
AccountMenu (wrapper)
├── AccountIcon (trigger button)
└── Dropdown (menu container)
    ├── UserInfo (email display)
    ├── ManageAccount (button)
    ├── Divider
    └── SignOut (button)
```

### Props Interface
```typescript
interface AccountMenuProps {
  className?: string;
}
```

### State Management
- No additional state management needed
- Leverage existing PocketBase authStore
- Use existing logout functionality

## File Changes Summary

### New Files
1. `ui/src/components/AccountIcon.tsx` - Circular account icon button
2. `ui/src/components/AccountMenu.tsx` - Complete account menu component

### Modified Files
1. `ui/src/components/Header.tsx` - Replace Sign Out button with AccountMenu

### Dependencies
- No new dependencies required
- Leverages existing Dropdown and Button components
- Uses existing PocketBase authentication system

## Testing Considerations

### Manual Testing Checklist
- [ ] Account icon displays correctly in header
- [ ] Dropdown opens on click
- [ ] User email displays correctly
- [ ] Manage Account button is present (stub)
- [ ] Sign Out functionality works
- [ ] Click outside closes dropdown
- [ ] ESC key closes dropdown
- [ ] Responsive behavior maintained
- [ ] Dark mode styling works correctly
- [ ] Accessibility features work

### Edge Cases to Handle
- User data not available
- Authentication state changes
- Network errors
- Very long email addresses
- Mobile responsive behavior

## Future Enhancements (Post-Implementation)

### Manage Account Feature
- Link to account settings page
- Profile editing capabilities
- Password change functionality

### Additional Menu Items
- User preferences
- Theme switching
- Help/Support links

### Enhanced User Display
- User avatar/profile picture
- Display name in addition to email
- User role or permissions display

## Implementation Notes

### Code Style
- Follow existing TypeScript patterns
- Use consistent naming conventions
- Maintain existing import patterns
- Follow TailwindCSS utility-first approach

### Performance Considerations
- Lazy load dropdown content if needed
- Minimize re-renders with proper memoization
- Use existing component patterns for consistency

### Browser Compatibility
- Leverage existing browser support
- Use progressive enhancement
- Follow existing accessibility standards

This implementation plan provides a comprehensive, well-integrated account menu that leverages the existing component architecture while providing a professional user experience.