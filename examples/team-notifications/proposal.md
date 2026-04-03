# Proposal: Team Notification System

## Problem Statement

Our platform sends notifications through a single channel (email), leading to alert fatigue and missed critical updates. Teams need notifications routed to the right channel (email, Slack, in-app, SMS) based on urgency, type, and user preferences — with guaranteed delivery for critical alerts.

## Target Users

- **End users** — customers receiving notifications about their account activity, billing, and feature updates
- **Team admins** — customers configuring notification rules for their organization
- **Internal operators** — employees monitoring delivery health and debugging failed notifications

## Proposed Solution

An event-driven notification system that accepts events from internal services, routes them through user-defined preferences to the appropriate delivery channel, and provides observability into delivery status. Critical notifications (security alerts, billing failures) use escalation — retrying failed channels and falling back to alternatives.

## Success Metrics

1. 99.9% delivery rate for critical notifications within 60 seconds
2. 50% reduction in "missed notification" support tickets within 3 months
3. 80% of team admins configure custom notification preferences within 30 days

## Out of Scope

- Push notifications to native mobile apps (v1 channels: email, Slack, in-app, SMS)
- Notification content creation UI (services produce their own content)
- Digest/batching of notifications (all notifications are individual for v1)
- Marketing or promotional notifications (transactional only)

## Prior Art & Market Research

- **Courier** — Third-party notification infrastructure. Strong routing and template engine. Risk: external dependency for critical path, cost at scale.
- **Novu** — Open-source notification infrastructure. Good preference management. Risk: operational burden of self-hosting.
- **AWS SNS + SES** — Low-level building blocks. Reliable but no preference routing, no escalation logic.
- **Approach**: Build in-house for control over the critical path, using SNS/SES as delivery primitives rather than outsourcing the routing layer.

## Context Links

- Incident post-mortem (missed billing alerts): https://docs.example.com/incident-2024-billing
- User research on notification preferences: https://docs.example.com/notif-research
- Current email service architecture: https://docs.example.com/email-arch

## Open Questions

- [RESOLVED] Should users be able to snooze notifications? → Deferred to v2
- [OPEN] What is the retry/backoff strategy for failed SMS delivery?
- [OPEN] Do we need a notification audit log for compliance?
