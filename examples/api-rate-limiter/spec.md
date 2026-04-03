# Spec: API Rate Limiter

## Overview

A distributed rate limiter at the API gateway layer that enforces per-client request limits using a sliding window algorithm with Redis-backed state. Supports tiered limits, returns standard rate limit headers, and provides internal tooling for monitoring and override.

## User Stories

### US-1: Enforce rate limits per client [P1]

As a **platform engineer**, I want to **enforce request-per-minute limits on each API client** so that **no single client can degrade the service for others**.

Acceptance Criteria:
- [ ] WHEN a client sends a request, THE SYSTEM SHALL check the client's current request count against their tier limit using a sliding window
- [ ] WHEN a client exceeds their rate limit, THE SYSTEM SHALL reject the request with HTTP 429 and a `Retry-After` header indicating seconds until the next available slot
- [ ] IF the rate limiter's backing store (Redis) is unavailable, THEN THE SYSTEM SHALL allow the request (fail open) and log a warning
- [ ] THE SYSTEM SHALL add < 5ms latency (p99) to request processing

### US-2: Rate limit headers on every response [P1]

As an **API consumer**, I want to **see my rate limit status in response headers** so that **I can build clients that respect the limits and avoid 429s**.

Acceptance Criteria:
- [ ] THE SYSTEM SHALL include these headers on every API response:
  - `RateLimit-Limit`: the client's requests-per-minute allowance
  - `RateLimit-Remaining`: requests remaining in the current window
  - `RateLimit-Reset`: seconds until the window resets
- [ ] WHEN a request is rejected (429), THE SYSTEM SHALL include the same headers plus a `Retry-After` header

### US-3: Tiered rate limits [P1]

As a **platform engineer**, I want to **assign different rate limits to different client tiers** so that **paying customers get appropriate capacity**.

Acceptance Criteria:
- [ ] THE SYSTEM SHALL support at minimum three tiers: free (60 req/min), standard (600 req/min), enterprise (6000 req/min)
- [ ] WHEN a client's tier changes, THE SYSTEM SHALL apply the new limit on the next request (no restart required)
- [ ] IF a client has no tier assigned, THEN THE SYSTEM SHALL apply the free tier by default

### US-4: Monitor rate limit usage [P2]

As an **on-call engineer**, I want to **see which clients are approaching or hitting their limits** so that **I can proactively address capacity issues**.

Acceptance Criteria:
- [ ] THE SYSTEM SHALL expose per-client metrics: current usage percentage, 429 count, peak request rate (rolling 1-hour window)
- [ ] WHEN a client exceeds 80% of their rate limit for 5 consecutive minutes, THE SYSTEM SHALL emit a warning alert
- [ ] WHEN a client receives more than 100 rejections (429s) in a 10-minute window, THE SYSTEM SHALL emit a critical alert

### US-5: Emergency override [P2]

As an **on-call engineer**, I want to **temporarily raise or lower a specific client's rate limit** so that **I can respond to incidents without a deployment**.

Acceptance Criteria:
- [ ] WHEN an engineer applies an override, THE SYSTEM SHALL apply it within 10 seconds across all gateway instances
- [ ] THE SYSTEM SHALL log all overrides with: who, when, which client, old limit, new limit, reason
- [ ] WHEN an override is set, THE SYSTEM SHALL require an expiration time (max 24 hours) after which the limit reverts to the tier default

### US-6: Client self-service usage dashboard [P3]

As an **API consumer**, I want to **see my current usage and rate limit status in a dashboard** so that **I can plan my integration's request patterns**.

Acceptance Criteria:
- [ ] WHEN a client views their dashboard, THE SYSTEM SHALL display: current tier, requests in the current window, historical usage (last 7 days), and any 429s received
- [ ] THE SYSTEM SHALL update the dashboard within 30 seconds of actual usage

## Requirements

### Functional Requirements

| ID | Priority | Description |
|----|----------|-------------|
| FR-1 | MUST | Enforce per-client rate limits using a sliding window algorithm |
| FR-2 | MUST | Reject requests exceeding the limit with HTTP 429 and `Retry-After` header |
| FR-3 | MUST | Include `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` headers on all responses |
| FR-4 | MUST | Support configurable tier-based limits (free, standard, enterprise) |
| FR-5 | MUST | Apply tier changes without restart or redeployment |
| FR-6 | SHOULD | Expose per-client usage metrics and alerting thresholds |
| FR-7 | SHOULD | Support temporary per-client limit overrides with automatic expiration |
| FR-8 | COULD | Provide a client-facing usage dashboard |

### Non-Functional Requirements

| ID | Priority | Description |
|----|----------|-------------|
| NFR-1 | MUST | Rate limit check adds < 5ms latency to request processing (p99) |
| NFR-2 | MUST | Fail open if Redis is unavailable — never block requests due to rate limiter failure |
| NFR-3 | MUST | Consistent enforcement across all gateway instances (distributed state via Redis) |
| NFR-4 | MUST | Handle 50,000 requests per second across all clients without rate limiter degradation |
| NFR-5 | SHOULD | Override propagation to all instances within 10 seconds |

### Constraints

| ID | Priority | Description |
|----|----------|-------------|
| C-1 | MUST | Implemented at the API gateway layer (not application code) |
| C-2 | MUST | Redis for distributed state (existing infrastructure) |
| C-3 | MUST | Must not require API consumer changes to existing integrations (additive headers only) |
| C-4 | MUST | Rate limit header format follows the IETF RateLimit header fields draft standard |

## Out of Scope

- Per-endpoint rate limits (global per-client only for v1)
- Automatic tier upgrades or billing integration
- Rate limiting for internal service-to-service calls
- Request queuing or throttling (rejected, not delayed)
- IP-based rate limiting (client API key only)

## Open Questions

- [OPEN] Should rate limit overrides for specific clients require approval, or can on-call engineers self-serve?
- [OPEN] How do we handle clients with multiple API keys — per-key or aggregate?
- [OPEN] Should the sliding window use a fixed granularity (e.g. 1-second buckets) or a true sliding window?
