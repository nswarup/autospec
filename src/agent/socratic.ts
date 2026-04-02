import Anthropic from "@anthropic-ai/sdk";
import type { ConversationState, Phase, Project } from "../spec/schema.js";
import { ProjectSchema } from "../spec/schema.js";
import {
  addMessage,
  getMessagesForApi,
  transitionPhase,
} from "../conversation/history.js";
import {
  buildSystemPrompt,
  buildPhaseTransitionMessage,
  EXTRACTION_PROMPT,
} from "./prompts.js";
import { getNextPhase, countPhaseTurns, PHASES } from "./phases.js";

export interface SocraticAgentOptions {
  model?: string;
  apiKey?: string;
}

export class SocraticAgent {
  private client: Anthropic;
  private model: string;

  constructor(options: SocraticAgentOptions = {}) {
    this.client = new Anthropic({
      apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
    this.model = options.model ?? "claude-sonnet-4-20250514";
  }

  async respond(
    state: ConversationState,
    userInput: string
  ): Promise<{ state: ConversationState; response: string }> {
    // Check for phase transition commands
    const transitionResult = this.handleTransitionCommand(state, userInput);
    if (transitionResult) {
      return transitionResult;
    }

    // Add user message
    let updatedState = addMessage(state, "user", userInput);

    // Check if AI suggested moving to next phase and user agreed
    const shouldTransition = this.detectPhaseTransition(updatedState);
    if (shouldTransition) {
      const nextPhase = getNextPhase(updatedState.currentPhase);
      if (nextPhase) {
        const transitionMsg = buildPhaseTransitionMessage(
          updatedState.currentPhase,
          nextPhase
        );
        updatedState = transitionPhase(updatedState, nextPhase);
        updatedState = addMessage(updatedState, "assistant", transitionMsg);
      }
    }

    // Build API messages
    const systemPrompt = buildSystemPrompt(updatedState.currentPhase);
    const apiMessages = getMessagesForApi(updatedState.messages);

    // Call Claude
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: apiMessages,
    });

    const assistantContent = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    updatedState = addMessage(updatedState, "assistant", assistantContent);

    return { state: updatedState, response: assistantContent };
  }

  async extractSpec(state: ConversationState): Promise<Project | null> {
    // First check if there's a <spec-json> block in recent messages
    const specJson = this.findSpecJson(state);
    if (specJson) {
      try {
        return ProjectSchema.parse(JSON.parse(specJson));
      } catch {
        // Fall through to extraction
      }
    }

    // Use Claude to extract from conversation
    const conversationText = state.messages
      .map((m) => `[${m.role.toUpperCase()} | ${m.phase}]: ${m.content}`)
      .join("\n\n");

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 8192,
      system: EXTRACTION_PROMPT,
      messages: [
        {
          role: "user",
          content: `Extract the spec from this conversation:\n\n${conversationText}`,
        },
      ],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    try {
      const parsed = JSON.parse(text);
      return ProjectSchema.parse(parsed);
    } catch {
      return null;
    }
  }

  private handleTransitionCommand(
    state: ConversationState,
    input: string
  ): { state: ConversationState; response: string } | null {
    const trimmed = input.trim().toLowerCase();

    // Direct phase jump: "/phase challenge"
    const phaseMatch = trimmed.match(
      /^\/phase\s+(explore|challenge|clarify|specify|refine)$/
    );
    if (phaseMatch) {
      const targetPhase = phaseMatch[1] as Phase;
      const msg = buildPhaseTransitionMessage(
        state.currentPhase,
        targetPhase
      );
      const newState = transitionPhase(
        addMessage(state, "user", input),
        targetPhase
      );
      return {
        state: addMessage(newState, "assistant", msg),
        response: msg,
      };
    }

    // "/next" to advance
    if (trimmed === "/next") {
      const nextPhase = getNextPhase(state.currentPhase);
      if (!nextPhase) {
        return {
          state: addMessage(state, "user", input),
          response:
            "You're already in the final phase (Refine). Use `/phase explore` to restart.",
        };
      }
      const msg = buildPhaseTransitionMessage(state.currentPhase, nextPhase);
      const newState = transitionPhase(
        addMessage(state, "user", input),
        nextPhase
      );
      return {
        state: addMessage(newState, "assistant", msg),
        response: msg,
      };
    }

    return null;
  }

  private detectPhaseTransition(state: ConversationState): boolean {
    const { messages, currentPhase } = state;
    if (messages.length < 2) return false;

    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    const lastUser = messages[messages.length - 1];

    if (!lastAssistant || lastUser.role !== "user") return false;

    // Check if assistant suggested moving on and user agreed
    const suggestsTransition =
      lastAssistant.content.toLowerCase().includes("move to") ||
      lastAssistant.content.toLowerCase().includes("transition to") ||
      lastAssistant.content.toLowerCase().includes("ready to move") ||
      lastAssistant.content.toLowerCase().includes("shall we move");

    const userAgrees =
      lastUser.content.toLowerCase().includes("yes") ||
      lastUser.content.toLowerCase().includes("let's go") ||
      lastUser.content.toLowerCase().includes("sounds good") ||
      lastUser.content.toLowerCase().includes("move on") ||
      lastUser.content.toLowerCase().includes("next phase") ||
      lastUser.content.toLowerCase().includes("let's move");

    // Also check minimum turns
    const turns = countPhaseTurns(messages, currentPhase);
    const minTurns = PHASES[currentPhase].minTurns;

    return suggestsTransition && userAgrees && turns >= minTurns;
  }

  private findSpecJson(state: ConversationState): string | null {
    for (let i = state.messages.length - 1; i >= 0; i--) {
      const msg = state.messages[i];
      const match = msg.content.match(
        /<spec-json>([\s\S]*?)<\/spec-json>/
      );
      if (match) return match[1].trim();
    }
    return null;
  }

  getPhaseStatus(state: ConversationState): string {
    const phase = PHASES[state.currentPhase];
    const turns = countPhaseTurns(state.messages, state.currentPhase);
    return `[${phase.displayName}] Turn ${turns}/${phase.suggestedMaxTurns} — ${phase.description}`;
  }
}
