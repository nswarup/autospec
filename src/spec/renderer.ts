import type { Project, Proposal, Spec } from "./schema.js";

export function renderProposal(proposal: Proposal): string {
  const lines: string[] = [
    `# ${proposal.title}`,
    "",
    "## Problem Statement",
    "",
    proposal.problemStatement,
    "",
    "## Target Users",
    "",
    ...proposal.targetUsers.map((u) => `- ${u}`),
    "",
    "## Proposed Solution",
    "",
    proposal.proposedSolution,
    "",
    "## Success Metrics",
    "",
    ...proposal.successMetrics.map((m, i) => `${i + 1}. ${m}`),
    "",
    "## Out of Scope",
    "",
    ...proposal.outOfScope.map((s) => `- ${s}`),
    "",
  ];

  if (proposal.openQuestions.length > 0) {
    lines.push("## Open Questions", "");
    for (const q of proposal.openQuestions) {
      const status = q.resolved ? "RESOLVED" : "OPEN";
      lines.push(`- **[${q.id}]** [${status}] ${q.question}`);
      if (q.resolved && q.resolution) {
        lines.push(`  - Resolution: ${q.resolution}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function renderSpec(spec: Spec): string {
  const lines: string[] = [
    `# ${spec.title} — Specification`,
    "",
    "## Overview",
    "",
    spec.overview,
    "",
    "## User Stories",
    "",
  ];

  for (const story of spec.userStories) {
    lines.push(
      `### ${story.id} [${story.priority}]`,
      "",
      `As a **${story.persona}**, I want to **${story.action}** so that **${story.benefit}**.`,
      "",
      "**Acceptance Criteria:**",
      ""
    );
    for (const ac of story.acceptanceCriteria) {
      lines.push(`- [ ] ${ac}`);
    }
    lines.push("");
  }

  lines.push("## Requirements", "");

  const grouped = {
    functional: spec.requirements.filter((r) => r.type === "functional"),
    "non-functional": spec.requirements.filter(
      (r) => r.type === "non-functional"
    ),
    constraint: spec.requirements.filter((r) => r.type === "constraint"),
  };

  for (const [type, reqs] of Object.entries(grouped)) {
    if (reqs.length === 0) continue;
    lines.push(
      `### ${type.charAt(0).toUpperCase() + type.slice(1)} Requirements`,
      ""
    );
    for (const req of reqs) {
      const priorityLabel = req.priority.toUpperCase();
      lines.push(`- **[${req.id}]** [${priorityLabel}] ${req.description}`);
    }
    lines.push("");
  }

  if (spec.outOfScope.length > 0) {
    lines.push("## Out of Scope", "");
    for (const item of spec.outOfScope) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (spec.openQuestions.length > 0) {
    lines.push("## Open Questions", "");
    for (const q of spec.openQuestions) {
      const status = q.resolved ? "RESOLVED" : "OPEN";
      lines.push(`- **[${q.id}]** [${status}] ${q.question}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function renderProject(project: Project): Record<string, string> {
  const files: Record<string, string> = {};

  if (project.proposal) {
    files["proposal.md"] = renderProposal(project.proposal);
  }
  if (project.spec) {
    files["spec.md"] = renderSpec(project.spec);
  }

  return files;
}
