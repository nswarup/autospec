# Proposal: API Rate Limiter

## Problem Statement

Our public API has no rate limiting. A single misbehaving client can degrade performance for all users, and we have no defense against abuse or accidental DDoS from integration partners. Last month, a partner's retry loop caused a 12-minute degradation affecting all API consumers.

## Target Users

- **API consumers** (external) — paying customers and integration partners who call our API
- **Platform engineers** (internal) — employees configuring rate limits and monitoring usage
- **On-call engineers** (internal) — employees responding to abuse or capacity incidents

## Proposed Solution

A distributed rate limiter that enforces per-client request limits at the API gateway layer. Supports multiple limit tiers (free, standard, enterprise), returns standard rate limit headers, and provides a dashboard for internal monitoring and override.

## Success Metrics

1. Zero API-wide degradation incidents caused by single-client traffic spikes (measured quarterly)
2. p99 latency overhead from rate limiting < 5ms
3. 100% of API responses include rate limit headers within 2 weeks of launch

## Out of Scope

- Per-endpoint rate limits (v1 is per-client global limits only)
- Automatic tier upgrades or billing integration
- Rate limiting for internal service-to-service calls
- Request queuing or throttling (excess requests are rejected, not delayed)

## Prior Art & Market Research

- **Stripe** — Returns `429` with `Retry-After` header. Per-key limits with burst allowance. Well-documented, industry standard response format.
- **GitHub API** — Sliding window, 5000 req/hour for authenticated, 60 for unauthenticated. Returns `X-RateLimit-*` headers on every response.
- **Cloudflare Rate Limiting** — Edge-based, WAF integration. Overkill for our use case and introduces vendor lock-in.
- **Kong / Envoy plugins** — Open-source gateway plugins. Good for standard cases, limited customization for tiered limits.
- **Approach**: Implement at the gateway layer using a sliding window algorithm with Redis for distributed state. Follow the IETF `RateLimit` header draft standard for response headers.

## Context Links

- Incident post-mortem (partner retry loop): https://docs.example.com/incident-2024-api-overload
- Current API gateway architecture: https://docs.example.com/api-gateway-arch
- Partner feedback on rate limits: https://docs.example.com/partner-feedback-rates

## Open Questions

- [RESOLVED] Sliding window vs fixed window vs token bucket? → Sliding window for fairness, token bucket for burst tolerance — use sliding window with small burst allowance
- [OPEN] Should rate limit overrides for specific clients require approval, or can on-call engineers self-serve?
