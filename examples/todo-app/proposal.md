# Proposal: Collaborative Todo App

## Problem Statement

Remote teams lack a lightweight, shared task tracker that lives where they already work (Slack/browser). Existing tools (Jira, Asana) are heavyweight for small teams who just need a shared checklist with real-time updates.

## Target Users

- **Small team leads** (3-8 people) — employees managing sprint tasks or project checklists
- **Individual contributors** — employees checking off and updating tasks throughout the day

## Proposed Solution

A real-time collaborative todo app with workspace-based task lists, assignees, due dates, and status tracking. Accessible via web browser with optional Slack integration for notifications.

## Success Metrics

1. 80% of workspace members interact with a shared list within 7 days of creation
2. Average task completion rate > 70% per list
3. < 500ms latency for real-time updates across all connected clients

## Out of Scope

- Native mobile apps (web-only for v1)
- Recurring/scheduled tasks
- File attachments on tasks
- Time tracking or estimation
- Gantt charts or timeline views

## Prior Art & Market Research

- **Todoist** — Feature-rich, individual-focused. Collaboration is a premium add-on. Overpowered for team checklists.
- **Linear** — Beautiful but engineering-focused (issues, cycles, sprints). Too structured for a simple shared list.
- **Google Tasks** — Minimal, no real-time collaboration. No assignees.
- **Approach**: We're targeting the gap between "too simple" (Google Tasks) and "too complex" (Linear) — a shared checklist with just enough structure.

## Context Links

- Product brief: https://docs.example.com/todo-app-brief
- User interview notes: https://docs.example.com/todo-interviews
- Slack thread with initial feedback: https://example.slack.com/archives/C0123/p456

## Open Questions

- [RESOLVED] Should lists be public to the workspace by default? → Yes, with option to make private
- [OPEN] Do we need an archive feature for completed lists, or just delete?
