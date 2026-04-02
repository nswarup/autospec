import type { ConversationState, Message, Phase } from "../spec/schema.js";

export function createConversation(projectName: string): ConversationState {
  const now = new Date().toISOString();
  return {
    projectName,
    currentPhase: "explore",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addMessage(
  state: ConversationState,
  role: "user" | "assistant",
  content: string
): ConversationState {
  const message: Message = {
    role,
    content,
    phase: state.currentPhase,
    timestamp: new Date().toISOString(),
  };
  return {
    ...state,
    messages: [...state.messages, message],
    updatedAt: new Date().toISOString(),
  };
}

export function transitionPhase(
  state: ConversationState,
  newPhase: Phase
): ConversationState {
  return {
    ...state,
    currentPhase: newPhase,
    updatedAt: new Date().toISOString(),
  };
}

export function getMessagesForApi(
  messages: Message[]
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}
