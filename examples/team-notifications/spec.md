# Spec: Team Notification System

## Overview

An event-driven notification system that routes events from internal services to users through their preferred channels (email, Slack, in-app, SMS), with escalation logic for critical alerts and observability into delivery health.

## User Stories

### US-1: Receive notifications on preferred channel [P1]

As an **end user**, I want to **receive notifications on the channel I prefer** so that **I see important updates where I'm most likely to act on them**.

Acceptance Criteria:
- [ ] WHEN an event triggers a notification, THE SYSTEM SHALL route it to the user's preferred channel for that notification type
- [ ] IF the user has not set a preference, THEN THE SYSTEM SHALL use the default channel for that notification type (defined by the team admin)
- [ ] THE SYSTEM SHALL support four delivery channels: email, Slack, in-app, and SMS

### US-2: Configure notification preferences [P1]

As a **team admin**, I want to **configure default notification routing for my organization** so that **my team gets alerts on the right channels without each person configuring individually**.

Acceptance Criteria:
- [ ] WHEN an admin sets a default channel for a notification type, THE SYSTEM SHALL apply it to all team members who have not set their own preference
- [ ] WHEN an individual user overrides a default, THE SYSTEM SHALL use the user's preference for that notification type
- [ ] THE SYSTEM SHALL group notification types into categories (security, billing, activity, system) for bulk configuration

### US-3: Critical notification escalation [P1]

As an **end user**, I want to **be reliably reached for critical alerts** so that **I never miss a security breach or billing failure**.

Acceptance Criteria:
- [ ] WHEN a critical notification fails to deliver on the primary channel, THE SYSTEM SHALL retry up to 3 times with exponential backoff (30s, 60s, 120s)
- [ ] IF all retries on the primary channel fail, THEN THE SYSTEM SHALL escalate to the next channel in the user's escalation chain
- [ ] THE SYSTEM SHALL deliver critical notifications within 60 seconds (p99) on the first successful channel
- [ ] WHILE a critical notification remains undelivered after exhausting all channels, THE SYSTEM SHALL alert the internal operations team

### US-4: Monitor delivery health [P1]

As an **internal operator**, I want to **see delivery success rates and failures in real time** so that **I can detect and resolve delivery issues before users are affected**.

Acceptance Criteria:
- [ ] THE SYSTEM SHALL expose delivery metrics per channel: success rate, failure rate, median latency, p99 latency
- [ ] WHEN a channel's failure rate exceeds 5% over a 5-minute window, THE SYSTEM SHALL trigger an internal alert
- [ ] WHEN a notification fails permanently (all retries exhausted), THE SYSTEM SHALL log the failure with event ID, user ID, channel, error, and timestamp

### US-5: User self-service preferences [P2]

As an **end user**, I want to **choose which notifications I receive and on which channels** so that **I'm not overwhelmed by irrelevant alerts**.

Acceptance Criteria:
- [ ] WHEN a user visits their notification settings, THE SYSTEM SHALL display all notification types grouped by category with their current channel selection
- [ ] WHEN a user disables a notification type, THE SYSTEM SHALL stop delivering it — unless it is classified as critical (critical notifications cannot be disabled)
- [ ] IF a user attempts to disable a critical notification, THEN THE SYSTEM SHALL explain why it cannot be disabled and suggest alternative channels instead

### US-6: Slack channel routing [P2]

As a **team admin**, I want to **route specific notification types to specific Slack channels** so that **the right alerts reach the right audience**.

Acceptance Criteria:
- [ ] WHEN an admin maps a notification type to a Slack channel, THE SYSTEM SHALL deliver matching notifications to that channel as bot messages
- [ ] IF the Slack bot token is invalid or the channel is archived, THEN THE SYSTEM SHALL fail gracefully, log the error, and fall back to individual user DMs

## Requirements

### Functional Requirements

| ID | Priority | Description |
|----|----------|-------------|
| FR-1 | MUST | Accept notification events from internal services via async message queue |
| FR-2 | MUST | Route notifications based on: notification type → user/org preference → default channel |
| FR-3 | MUST | Support four delivery channels: email (SES), Slack (Bot API), in-app (WebSocket), SMS (SNS) |
| FR-4 | MUST | Retry failed deliveries up to 3 times with exponential backoff |
| FR-5 | MUST | Escalate critical notifications through the user's channel chain when primary fails |
| FR-6 | MUST | Expose delivery metrics and health status per channel |
| FR-7 | SHOULD | Allow team admins to set organization-wide default channel per notification type |
| FR-8 | SHOULD | Allow users to override org defaults with personal preferences |
| FR-9 | SHOULD | Prevent users from disabling critical notification types |
| FR-10 | COULD | Route Slack notifications to specific channels (not just user DMs) |

### Non-Functional Requirements

| ID | Priority | Description |
|----|----------|-------------|
| NFR-1 | MUST | Critical notifications delivered within 60 seconds (p99) |
| NFR-2 | MUST | System handles 10,000 notification events per minute at peak |
| NFR-3 | MUST | 99.9% delivery success rate for critical notifications |
| NFR-4 | MUST | No duplicate deliveries for the same event+user+channel combination |
| NFR-5 | SHOULD | Event processing latency < 200ms (p95) from queue receipt to first delivery attempt |

### Constraints

| ID | Priority | Description |
|----|----------|-------------|
| C-1 | MUST | Email delivery via AWS SES (existing infrastructure) |
| C-2 | MUST | SMS delivery via AWS SNS (existing infrastructure) |
| C-3 | MUST | Event ingestion via SQS/SNS (existing message bus) |
| C-4 | MUST | Must not introduce new infrastructure dependencies beyond existing AWS stack |

## Out of Scope

- Push notifications to native mobile apps
- Notification content creation or template management UI
- Digest or batching of notifications
- Marketing or promotional notifications
- User snooze/mute functionality (deferred to v2)

## Open Questions

- [OPEN] What is the retry/backoff strategy for failed SMS delivery when carrier rate limits are hit?
- [OPEN] Do we need a notification audit log for compliance (SOC2)?
- [OPEN] Should in-app notifications persist after being read, and for how long?
