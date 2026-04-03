# CLAUDE.md

This is the autospec project — a suite of Socratic slash commands for Claude Code that guide users from idea to implementation-ready spec.

## What this repo contains

- `.claude/commands/` — Seven slash command prompts that form a pipeline:
  - `spec.md` — Socratic spec elicitation (what/why)
  - `design.md` — Technical design with data models, architecture, API contracts
  - `rfc.md` — Team-shareable RFC capturing the "why" behind decisions
  - `tasks.md` — Implementation plan with dependency graph and PR structure
  - `review.md` — Pre-implementation readiness check
  - `bugfix.md` — Bug diagnosis (spec gap vs implementation gap)
  - `drift.md` — Spec-code divergence detection
- `.claude/principles.md` — Template for project-level rules all commands respect
- `examples/` — Three sample spec outputs showing the expected format:
  - `todo-app/` — Consumer web app (real-time collaboration, WebSocket handling)
  - `team-notifications/` — Event-driven system (multi-channel routing, escalation)
  - `api-rate-limiter/` — Infrastructure component (distributed state, fail-open design)
- No application code — this repo is purely prompt engineering

## Architecture

Each command is a standalone markdown prompt that follows a consistent structure:
1. Role definition and prerequisites
2. Project Principles section (reads `.claude/principles.md`)
3. Output Location section (reads/writes to `specs/[feature-slug]/`)
4. Core Principles (behavioral constraints)
5. Phases (the Socratic dialogue flow)
6. Getting Started (entry point)

Commands form a pipeline where each reads the output of previous commands:
`/spec` → `/design` → `/rfc` → `/tasks` → `/review`

The maintenance commands (`/bugfix`, `/drift`) can be run at any time against existing artifacts.

## Conventions

- All output artifacts go to `specs/[feature-slug]/` directories
- Requirements use EARS notation (WHEN/WHILE/IF...THE SYSTEM SHALL)
- IDs are namespaced: US- (user stories), FR- (functional requirements), NFR- (non-functional), D- (decisions), TS- (test scenarios), T- (tasks), DR- (drift items), RV- (review findings), BF- (bugfixes)
- Each command checks for prerequisites and suggests the next command in the pipeline

## When editing commands

- Keep the Socratic tone — these prompts ask questions, they don't dictate
- Every output section should trace back to a requirement or decision
- Test your changes by running the command and verifying the dialogue flow
- The pipeline is sequential — changes to upstream outputs (e.g. spec.md format) affect downstream commands
