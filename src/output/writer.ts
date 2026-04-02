import * as fs from "node:fs";
import * as path from "node:path";
import type { ConversationState, Project } from "../spec/schema.js";
import { renderProject } from "../spec/renderer.js";

const AUTOSPEC_DIR = ".autospec";

export function getAutospecDir(cwd?: string): string {
  return path.join(cwd ?? process.cwd(), AUTOSPEC_DIR);
}

export function ensureAutospecDir(cwd?: string): string {
  const dir = getAutospecDir(cwd);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function saveConversation(
  state: ConversationState,
  cwd?: string
): string {
  const dir = ensureAutospecDir(cwd);
  const filePath = path.join(dir, "conversation.json");
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
  return filePath;
}

export function loadConversation(cwd?: string): ConversationState | null {
  const dir = getAutospecDir(cwd);
  const filePath = path.join(dir, "conversation.json");
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as ConversationState;
  } catch {
    return null;
  }
}

export function saveSpecArtifacts(project: Project, cwd?: string): string[] {
  const dir = ensureAutospecDir(cwd);
  const files = renderProject(project);
  const savedPaths: string[] = [];

  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, content, "utf-8");
    savedPaths.push(filePath);
  }

  // Also save raw JSON for machine consumption
  const jsonPath = path.join(dir, "spec.json");
  fs.writeFileSync(jsonPath, JSON.stringify(project, null, 2), "utf-8");
  savedPaths.push(jsonPath);

  return savedPaths;
}
