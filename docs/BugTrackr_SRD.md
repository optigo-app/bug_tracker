# BugTracker
## System Requirements Document (SRD)
Version: 1.0  
System Type: Internal Bug Management System  
Deployment Model: Single Server  
Technology Stack: Next.js + MSSQL + Local File Storage  

---

# 1. System Overview

## 1.1 Purpose

This document defines the system-level requirements, architecture, and operational environment for the BugTracker system.

The SRD translates business requirements (PRD) into technical system specifications.

---

# 2. System Architecture

## 2.1 Architecture Style

BugTracker follows a three-tier architecture:

Presentation Layer (Next.js Frontend)
↓
Application Layer (Next.js API Routes)
↓
Data Layer (MSSQL Database)
↓
File Storage Layer (Local Server Storage)


---

## 2.2 System Components

### 2.2.1 Presentation Layer

- Built with Next.js (App Router)
- React-based UI
- JWT-based session handling
- Role-based UI rendering
- Responsive design

Responsibilities:
- User interaction
- Data rendering
- Form submission
- Client-side validation

---

### 2.2.2 Application Layer

Implemented using Next.js API routes.

Responsibilities:
- Business logic execution
- Authentication and authorization
- Input validation
- File upload handling
- Database interaction
- Audit logging

---

### 2.2.3 Data Layer

Database: Microsoft SQL Server

Responsibilities:
- Store structured system data
- Enforce relational integrity
- Support indexing for performance
- Handle concurrency control

---

### 2.2.4 File Storage Layer

Local file storage within server environment.

Directory structure:
/uploads
/bugs
/{bugId}
attachment1.png
error-log.txt


Responsibilities:
- Store uploaded files
- Maintain directory structure
- Serve files securely via protected API

---

# 3. Functional System Requirements

## 3.1 Authentication & Authorization

- System must authenticate users via JWT.
- System must enforce role-based access control (RBAC).
- System must restrict API access based on user role.
- Unauthorized users must not access protected endpoints.

---

## 3.2 Project Management

- System must allow creation of projects.
- System must manage project membership.
- System must support project-level roles.
- System must isolate data per project.

---

## 3.3 Bug Management

- System must support full CRUD for bugs.
- System must allow status transitions.
- System must log all field changes.
- System must support assignment to users.
- System must allow comment threading.

---

## 3.4 Attachment Management

- System must accept multipart file uploads.
- System must validate file size (max 10MB).
- System must validate MIME type.
- System must store file metadata in database.
- System must restrict file access to authenticated users.
- System must stream files securely via API route.

---

## 3.5 Search & Filtering

- System must support filtering by:
  - Status
  - Assignee
  - Priority
  - Date range
- System must support keyword search.
- System must support pagination.

---

## 3.6 Activity Logging

- System must record all significant state changes.
- System must maintain chronological activity logs.
- System must allow viewing of change history per bug.

---

# 4. Non-Functional System Requirements

## 4.1 Performance

- Average API response time < 300ms.
- Support minimum 100 concurrent users.
- Support minimum 10,000 bug records.
- Queries must use indexed columns.

---

## 4.2 Scalability

- System designed for vertical scaling.
- File storage isolated for future cloud migration.
- Upgrade path to object storage supported.

---

## 4.3 Availability

- Target uptime: 99%.
- Must support server restart recovery.
- File storage must persist across deployments.

---

## 4.4 Security

- Password hashing using bcrypt.
- JWT expiration and validation.
- Parameterized database queries.
- File upload validation.
- Role-based middleware enforcement.
- Protection against SQL injection and XSS.

---

## 4.5 Data Integrity

- Use optimistic concurrency control (RowVersion).
- Enforce foreign key constraints.
- Prevent duplicate project names (optional unique constraint).
- Soft delete strategy for bugs.

---

# 5. System Constraints

- Single-server deployment.
- Local file storage only.
- MSSQL required as database.
- No serverless hosting.
- No distributed file system (initial phase).

---

# 6. Environment Requirements

## 6.1 Server Requirements

- Windows Server or Linux VPS
- Node.js LTS installed
- MSSQL Server installed
- Minimum 8GB RAM recommended
- SSD storage recommended

---

## 6.2 Development Environment

- Node.js (LTS)
- npm or yarn
- Prisma ORM
- Git version control
- MSSQL local instance

---

# 7. External Interfaces

## 7.1 User Interface

- Web-based interface
- Responsive design
- Role-specific dashboard

---

## 7.2 Database Interface

- MSSQL connection via Prisma
- Connection pooling enabled

---

## 7.3 File Interface

- Local filesystem using Node.js FS module
- Secure file streaming endpoint

---

# 8. Logging & Monitoring

- Application-level logging
- Error logging
- Audit logging for bug changes
- Optional integration with monitoring tools

---

# 9. Future Expansion Considerations

- Multi-tenant architecture
- Cloud storage integration
- Real-time updates (WebSocket)
- Redis caching
- Reporting and analytics module

---

# End of SRD