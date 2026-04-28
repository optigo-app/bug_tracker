Design a modern, enterprise-grade Bug Management System web application UI called "BugTrackr".

Tech Context:
- Next.js 14 (App Router)
- Internal company tool
- Clean, scalable UI
- Responsive design
- Dark & Light mode support
- Tailwind CSS styling

Style Requirements:
- Minimal, professional, enterprise look
- Similar feel to Jira or Linear
- Clean typography
- Soft shadows
- Subtle borders
- Rounded corners (8px)
- Neutral color palette (slate/gray base)
- Primary accent color: Indigo or Blue

Layout Structure:
- Left vertical sidebar (collapsible)
- Top navigation bar
- Main content area with padding
- Breadcrumb navigation
- Consistent spacing (8px grid system)

---

Pages to Design:

1️⃣ Login Page
- Centered card layout
- Email field
- Password field
- Remember me checkbox
- Login button (primary)
- Clean minimal background
- Company logo placeholder

---

2️⃣ Dashboard Page
- Summary cards:
  - Total Bugs
  - Open Bugs
  - In Progress
  - Closed
- Recent Activity panel
- Bugs by Status (pie chart placeholder)
- Bugs by Assignee (bar chart placeholder)
- Clean card-based grid layout

---

3️⃣ Project List Page
- Table view
  Columns:
    - Project Name
    - Description
    - Members count
    - Created Date
    - Actions (Edit/Delete)
- Create Project button (top right)
- Search bar
- Pagination

---

4️⃣ Bug List Page (Main Page)
- Filter bar at top:
    - Status dropdown
    - Priority dropdown
    - Assignee dropdown
    - Date range picker
    - Search input
- Table layout:
    - Bug ID
    - Title
    - Status (badge)
    - Priority (colored badge)
    - Assignee (avatar + name)
    - Due date
    - Created date
- Pagination at bottom
- Click row to open detail drawer/page

---

5️⃣ Bug Detail Page
Layout:
- Header:
    - Bug ID
    - Title
    - Status badge
    - Priority badge
    - Edit button
- Left section (70%):
    - Description (rich text display)
    - Steps to reproduce
    - Environment details
    - Attachments section (file cards)
    - Comments section (threaded layout)
- Right sidebar (30%):
    - Assignee selector
    - Reporter
    - Status dropdown
    - Priority dropdown
    - Due date picker
    - Activity timeline

Attachments UI:
- File cards with:
    - File icon
    - File name
    - File size
    - Download button
- Drag & drop upload area

---

6️⃣ Create / Edit Bug Modal
- Modal layout
- Fields:
    - Title
    - Description (rich editor)
    - Project
    - Priority
    - Severity
    - Assignee
    - Due Date
- Submit & Cancel buttons

---

7️⃣ User Management Page (Admin)
- Table:
    - Name
    - Email
    - Role
    - Status
    - Actions
- Add User button
- Role dropdown

---

Component Requirements:

- Status Badge Component:
    Open → Gray
    In Progress → Blue
    Testing → Orange
    Closed → Green
    Reopened → Red

- Priority Badge:
    Low → Gray
    Medium → Blue
    High → Orange
    Critical → Red

- Reusable Card component
- Reusable Table component
- Reusable Modal component
- Reusable Dropdown component
- Avatar component

---

UX Requirements:

- Smooth hover transitions
- Loading skeletons
- Empty state illustrations
- Toast notifications
- Confirmation modal for delete
- Keyboard accessible
- Accessible color contrast

---

Responsive Behavior:

- Sidebar collapses on tablet
- Mobile uses bottom navigation
- Tables become stacked cards on small screens

---

Deliverables:

- Full layout structure
- Component hierarchy
- Design tokens (spacing, typography, color)
- UI ready for Tailwind implementation
- Clean React component breakdown