# autospec

A Socratic spec-writing slash command for [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

Instead of generating a spec in one shot, autospec uses the Socratic method — asking probing questions, challenging assumptions, identifying gaps, and iteratively refining the specification through back-and-forth conversation.

## Setup

Add this repo as a dependency in your project's `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": ["Bash(git clone*)"]
  },
  "mcpServers": {},
  "customSlashCommands": {
    "spec": {
      "source": "https://github.com/nswarup/autospec"
    }
  }
}
```

Or simply copy `.claude/commands/spec.md` into your project's `.claude/commands/` directory.

## Usage

```
/spec my-project-name
```

Claude will guide you through five phases:

1. **Explore** — Discover the problem space. "What are you building? For whom? Why now?"
2. **Challenge** — Stress-test assumptions. "What happens when X fails? What about scale?"
3. **Clarify** — Confirm understanding. "Let me play back what I've heard..."
4. **Specify** — Generate structured artifacts (`proposal.md` + `spec.md`)
5. **Refine** — Iterate until the spec is solid

## Output

At the end of the conversation, Claude writes two files:

- **`proposal.md`** — Problem statement, target users, success metrics, open questions
- **`spec.md`** — User stories with acceptance criteria, requirements (functional, non-functional, constraints), scope boundaries

## Inspiration

- [github/spec-kit](https://github.com/github/spec-kit)
- [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
