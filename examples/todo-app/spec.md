# Spec: Collaborative Todo App

## Overview

A real-time collaborative todo application where small teams can create shared task lists, assign items, set due dates, and track completion — with instant updates across all connected clients.

## User Stories

### US-1: Create a shared list [P1]

As a **team lead**, I want to **create a new task list and share it with my workspace** so that **the team has a single place to track work**.

Acceptance Criteria:
- [ ] WHEN a user creates a new list, THE SYSTEM SHALL assign it a unique URL and display it in the workspace's list directory
- [ ] WHEN a list is created, THE SYSTEM SHALL make it visible to all workspace members by default
- [ ] WHERE the user selects "private list", THE SYSTEM SHALL restrict visibility to only invited members

### US-2: Add and manage tasks [P1]

As a **team member**, I want to **add tasks to a list with optional assignee and due date** so that **work is clearly defined and owned**.

Acceptance Criteria:
- [ ] WHEN a user adds a task, THE SYSTEM SHALL display it to all connected clients within 500ms
- [ ] THE SYSTEM SHALL require a task title (1-500 characters) and allow optional assignee and due date fields
- [ ] WHEN a user marks a task complete, THE SYSTEM SHALL visually distinguish it from incomplete tasks and update all connected clients in real time
- [ ] IF a task title exceeds 500 characters, THEN THE SYSTEM SHALL reject the input and display a validation message

### US-3: Real-time collaboration [P1]

As a **team member**, I want to **see changes from other team members instantly** so that **we don't duplicate work or miss updates**.

Acceptance Criteria:
- [ ] WHILE multiple users are viewing the same list, THE SYSTEM SHALL propagate all changes (add, edit, complete, delete) to all clients within 500ms
- [ ] WHEN a user connects to a list, THE SYSTEM SHALL show the current state including any changes made while they were disconnected
- [ ] IF the WebSocket connection drops, THEN THE SYSTEM SHALL attempt to reconnect automatically and sync missed changes on reconnection

### US-4: Due date reminders [P2]

As a **team member**, I want to **see which tasks are overdue or due soon** so that **I can prioritize my work**.

Acceptance Criteria:
- [ ] WHEN a task's due date is today, THE SYSTEM SHALL display a "due today" indicator
- [ ] WHEN a task's due date has passed and the task is incomplete, THE SYSTEM SHALL display an "overdue" indicator
- [ ] WHERE Slack integration is enabled, THE SYSTEM SHALL send a reminder to the assignee 24 hours before the due date

### US-5: Workspace management [P2]

As a **team lead**, I want to **invite members to my workspace** so that **they can access shared lists**.

Acceptance Criteria:
- [ ] WHEN a team lead sends an invite, THE SYSTEM SHALL deliver an email with a join link that expires after 7 days
- [ ] WHEN a user joins via invite link, THE SYSTEM SHALL add them to the workspace and show all public lists
- [ ] IF an invite link has expired, THEN THE SYSTEM SHALL display an expiration message and prompt the user to request a new invite

## Requirements

### Functional Requirements

| ID | Priority | Description |
|----|----------|-------------|
| FR-1 | MUST | Users can create, read, update, and delete task lists |
| FR-2 | MUST | Users can create, read, update, complete, and delete tasks within a list |
| FR-3 | MUST | Tasks support title (required), assignee (optional), due date (optional), and status (incomplete/complete) |
| FR-4 | MUST | All list mutations propagate to connected clients in real time |
| FR-5 | MUST | Workspace-based access control: members see public lists, private lists require invitation |
| FR-6 | SHOULD | Visual indicators for overdue and due-today tasks |
| FR-7 | SHOULD | Email-based workspace invitations with expiring join links |
| FR-8 | COULD | Slack integration for due date reminders |

### Non-Functional Requirements

| ID | Priority | Description |
|----|----------|-------------|
| NFR-1 | MUST | Real-time updates delivered to all clients within 500ms (p95) |
| NFR-2 | MUST | Support 50 concurrent users per list without degradation |
| NFR-3 | MUST | All API endpoints respond within 200ms (p95) |
| NFR-4 | SHOULD | Automatic reconnection after WebSocket disconnection with state sync |
| NFR-5 | SHOULD | Data encrypted in transit (TLS) and at rest |

### Constraints

| ID | Priority | Description |
|----|----------|-------------|
| C-1 | MUST | Web-only for v1 — no native mobile apps |
| C-2 | MUST | Must work in latest Chrome, Firefox, Safari, and Edge |

## Out of Scope

- Native mobile applications
- Recurring or scheduled tasks
- File attachments
- Time tracking or estimation
- Gantt charts, timeline views, or calendar views
- Task comments or activity feed

## Open Questions

- [OPEN] Do we need an archive feature for completed lists, or just delete?
- [OPEN] Should completed tasks auto-sort to the bottom of the list?
