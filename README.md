# autospec

A Socratic conversational agent that helps you create great project specs through dialogue.

Instead of generating a spec in one shot, autospec uses the Socratic method — asking probing questions, challenging assumptions, identifying gaps, and iteratively refining the specification through back-and-forth conversation.

## How It Works

autospec guides you through five phases:

1. **Explore** — Discover the problem space. "What are you building? For whom? Why now?"
2. **Challenge** — Stress-test assumptions. "What happens when X fails? What about scale?"
3. **Clarify** — Confirm understanding. "Let me play back what I've heard..."
4. **Specify** — Generate structured artifacts (proposal, spec, requirements)
5. **Refine** — Iterate until the spec is solid

## Quick Start

```bash
npm install
npm run build

# Start a new spec conversation
node dist/index.js new "my-project"

# Resume a previous conversation
node dist/index.js resume

# Export spec artifacts
node dist/index.js export
```

Requires `ANTHROPIC_API_KEY` environment variable.

## Commands (during conversation)

| Command | Description |
|---------|-------------|
| `/next` | Advance to the next phase |
| `/phase <name>` | Jump to a specific phase |
| `/status` | Show conversation progress |
| `/export` | Extract and save spec artifacts |
| `/save` | Save conversation to disk |
| `/help` | Show available commands |
| `/quit` | Save and exit |

## Output

Specs are saved to `.autospec/` in your project directory:

- `conversation.json` — Full dialogue history
- `proposal.md` — Problem statement, target users, success metrics
- `spec.md` — User stories, requirements, acceptance criteria
- `spec.json` — Machine-readable spec data

## Inspiration

- [github/spec-kit](https://github.com/github/spec-kit) — Spec-driven development toolkit
- [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) — Specification-driven development framework
