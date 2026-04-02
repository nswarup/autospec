import { z } from "zod";

// --- Conversation-level schemas ---

export const PhaseSchema = z.enum([
  "explore",
  "challenge",
  "clarify",
  "specify",
  "refine",
]);
export type Phase = z.infer<typeof PhaseSchema>;

export const MessageRoleSchema = z.enum(["user", "assistant"]);

export const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string(),
  phase: PhaseSchema,
  timestamp: z.string().datetime(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ConversationStateSchema = z.object({
  projectName: z.string(),
  currentPhase: PhaseSchema,
  messages: z.array(MessageSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ConversationState = z.infer<typeof ConversationStateSchema>;

// --- Spec artifact schemas ---

export const UserStorySchema = z.object({
  id: z.string(),
  persona: z.string(),
  action: z.string(),
  benefit: z.string(),
  priority: z.enum(["P1", "P2", "P3"]),
  acceptanceCriteria: z.array(z.string()),
});
export type UserStory = z.infer<typeof UserStorySchema>;

export const RequirementSchema = z.object({
  id: z.string(),
  description: z.string(),
  type: z.enum(["functional", "non-functional", "constraint"]),
  priority: z.enum(["must", "should", "could"]),
});
export type Requirement = z.infer<typeof RequirementSchema>;

export const OpenQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  context: z.string().optional(),
  resolved: z.boolean().default(false),
  resolution: z.string().optional(),
});
export type OpenQuestion = z.infer<typeof OpenQuestionSchema>;

export const ProposalSchema = z.object({
  title: z.string(),
  problemStatement: z.string(),
  targetUsers: z.array(z.string()),
  proposedSolution: z.string(),
  outOfScope: z.array(z.string()),
  successMetrics: z.array(z.string()),
  openQuestions: z.array(OpenQuestionSchema),
});
export type Proposal = z.infer<typeof ProposalSchema>;

export const SpecSchema = z.object({
  title: z.string(),
  overview: z.string(),
  userStories: z.array(UserStorySchema),
  requirements: z.array(RequirementSchema),
  openQuestions: z.array(OpenQuestionSchema),
  outOfScope: z.array(z.string()),
});
export type Spec = z.infer<typeof SpecSchema>;

export const DesignDecisionSchema = z.object({
  id: z.string(),
  decision: z.string(),
  rationale: z.string(),
  alternatives: z.array(z.string()),
});

export const DesignSchema = z.object({
  title: z.string(),
  architecture: z.string(),
  components: z.array(
    z.object({
      name: z.string(),
      responsibility: z.string(),
      interfaces: z.array(z.string()),
    })
  ),
  decisions: z.array(DesignDecisionSchema),
  dataModel: z.string().optional(),
});
export type Design = z.infer<typeof DesignSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  storyId: z.string().optional(),
  dependsOn: z.array(z.string()),
  parallelizable: z.boolean().default(false),
  status: z.enum(["pending", "in-progress", "done"]).default("pending"),
});

export const TaskListSchema = z.object({
  title: z.string(),
  tasks: z.array(TaskSchema),
});
export type TaskList = z.infer<typeof TaskListSchema>;

// --- Top-level project schema ---

export const ProjectSchema = z.object({
  proposal: ProposalSchema.optional(),
  spec: SpecSchema.optional(),
  design: DesignSchema.optional(),
  tasks: TaskListSchema.optional(),
});
export type Project = z.infer<typeof ProjectSchema>;
