# autospec

A suite of Socratic slash commands for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that guide you from idea to implementation-ready spec through structured dialogue.

Instead of generating artifacts in one shot, autospec uses the Socratic method — asking probing questions, challenging assumptions, conducting research, and iteratively refining through conversation.

## The Pipeline

```
/spec  →  /design  →  /rfc  →  /tasks  →  /review
"what"    "how"       "why"    "do it"    "ready?"
```

| Command | Purpose | Output |
|---------|---------|--------|
| `/spec` | Discover requirements through Socratic dialogue | `proposal.md`, `spec.md` |
| `/design` | Produce a technical design grounded in the spec and codebase | `design.md` |
| `/rfc` | Generate a team-shareable RFC capturing the "why" behind decisions | `rfc.md` |
| `/tasks` | Break the spec and design into an ordered implementation plan | `tasks.md` |
| `/review` | Pre-implementation readiness check across all artifacts | `review.md` |

Plus two maintenance commands:

| Command | Purpose | Output |
|---------|---------|--------|
| `/bugfix` | Diagnose bugs as spec gaps vs implementation gaps | `bugfix-NNN.md` |
| `/drift` | Detect where spec and code have diverged | `drift-report.md` |

## Setup

Add autospec as a command source in your project's `.claude/settings.json`:

```json
{
  "customSlashCommands": {
    "spec": { "source": "https://github.com/nswarup/autospec" },
    "design": { "source": "https://github.com/nswarup/autospec" },
    "rfc": { "source": "https://github.com/nswarup/autospec" },
    "tasks": { "source": "https://github.com/nswarup/autospec" },
    "review": { "source": "https://github.com/nswarup/autospec" },
    "bugfix": { "source": "https://github.com/nswarup/autospec" },
    "drift": { "source": "https://github.com/nswarup/autospec" }
  }
}
```

Or copy the `.claude/commands/` directory into your project.

## Usage

### Start a new feature

```
/spec user authentication system
```

Claude guides you through five phases: **Explore** (discover the problem from business, user, technical, and market perspectives) → **Challenge** (stress-test assumptions) → **Clarify** (confirm understanding with EARS acceptance criteria) → **Specify** (generate artifacts) → **Refine** (iterate until solid).

Then continue through the pipeline:

```
/design user authentication system
/rfc user authentication system
/tasks user authentication system
/review user authentication system
```

### Diagnose a bug

```
/bugfix login fails for users with special characters in password
```

Classifies the root cause as a **spec gap** (the spec missed something) or an **implementation gap** (the code doesn't match the spec), then prescribes the fix path accordingly.

### Check for drift

```
/drift user authentication system
```

Compares spec, design, and code in both directions — finding things that were specified but not implemented, and things that were implemented but not specified.

## Output Structure

All artifacts for a feature are organized in a single directory:

```
specs/
  user-authentication-system/
    proposal.md        ← /spec
    spec.md            ← /spec
    design.md          ← /design
    rfc.md             ← /rfc
    tasks.md           ← /tasks
    review.md          ← /review
    bugfix-001.md      ← /bugfix
    drift-report.md    ← /drift
```

## Project Principles

Create `.claude/principles.md` to define persistent rules that all commands respect — coding standards, architectural constraints, tech stack, testing requirements, security policies, and team conventions. See the [template](.claude/principles.md) for the full structure.

## Key Features

- **EARS acceptance criteria** — Requirements use structured [EARS notation](https://en.wikipedia.org/wiki/EARS_(Requirements_Engineering)) ("WHEN [event], THE SYSTEM SHALL [behavior]") for testable, unambiguous criteria
- **Market & technical research** — `/spec` conducts market research during discovery; `/design` investigates libraries, benchmarks, and security before making decisions
- **Full traceability** — Requirements (FR-1) → design decisions (D-1) → test scenarios (TS-1) → tasks (T-1) — every artifact traces back to its source
- **Test plan** — `/design` generates a risk-prioritized test plan with concrete scenarios derived from EARS criteria; `/tasks` schedules test work before implementation
- **Bugfix classification** — `/bugfix` distinguishes spec gaps from implementation gaps and fixes the right artifact first
- **Drift detection** — `/drift` catches spec rot before it becomes a problem

## Examples

The [`examples/`](examples/) directory contains complete sample specs showing what `/spec` produces:

| Example | Type | Highlights |
|---------|------|------------|
| [`todo-app`](examples/todo-app/) | Consumer web app | Real-time collaboration, WebSocket reconnection, workspace access control |
| [`team-notifications`](examples/team-notifications/) | Event-driven system | Multi-channel routing, escalation logic, critical delivery guarantees |
| [`api-rate-limiter`](examples/api-rate-limiter/) | Infrastructure/platform | Distributed state, fail-open design, tiered limits, IETF standard headers |

Each example includes `proposal.md` (stakeholder summary with market research) and `spec.md` (user stories with EARS acceptance criteria, requirements, and open questions).

## Inspiration

- [Kiro](https://kiro.dev/) — spec-driven IDE with EARS notation and agent hooks
- [GitHub spec-kit](https://github.com/github/spec-kit) — specification-driven development methodology
- [CodeSpeak](https://codespeak.dev/) — formal specification language for LLMs
- [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
