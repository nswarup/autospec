import type { Phase } from "../spec/schema.js";
import { PHASE_ORDER } from "./prompts.js";

export interface PhaseInfo {
  name: Phase;
  displayName: string;
  description: string;
  minTurns: number;
  suggestedMaxTurns: number;
}

export const PHASES: Record<Phase, PhaseInfo> = {
  explore: {
    name: "explore",
    displayName: "Explore",
    description: "Discover the problem space, stakeholders, and motivation",
    minTurns: 3,
    suggestedMaxTurns: 10,
  },
  challenge: {
    name: "challenge",
    displayName: "Challenge",
    description: "Stress-test assumptions, find edge cases and gaps",
    minTurns: 2,
    suggestedMaxTurns: 8,
  },
  clarify: {
    name: "clarify",
    displayName: "Clarify",
    description: "Confirm shared understanding with structured playback",
    minTurns: 1,
    suggestedMaxTurns: 4,
  },
  specify: {
    name: "specify",
    displayName: "Specify",
    description: "Generate structured specification artifacts",
    minTurns: 1,
    suggestedMaxTurns: 3,
  },
  refine: {
    name: "refine",
    displayName: "Refine",
    description: "Iterate on the spec based on feedback",
    minTurns: 0,
    suggestedMaxTurns: 10,
  },
};

export function getNextPhase(current: Phase): Phase | null {
  const idx = PHASE_ORDER.indexOf(current);
  if (idx === -1 || idx >= PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[idx + 1];
}

export function getPreviousPhase(current: Phase): Phase | null {
  const idx = PHASE_ORDER.indexOf(current);
  if (idx <= 0) return null;
  return PHASE_ORDER[idx - 1];
}

export function countPhaseTurns(
  messages: Array<{ phase: Phase; role: string }>,
  phase: Phase
): number {
  return messages.filter((m) => m.phase === phase && m.role === "user").length;
}
