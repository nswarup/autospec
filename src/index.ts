#!/usr/bin/env node

import { Command } from "commander";
import * as readline from "node:readline";
import chalk from "chalk";
import { SocraticAgent } from "./agent/socratic.js";
import { PHASES } from "./agent/phases.js";
import { PHASE_ORDER } from "./agent/prompts.js";
import { createConversation } from "./conversation/history.js";
import {
  saveConversation,
  loadConversation,
  saveSpecArtifacts,
} from "./output/writer.js";
import type { ConversationState } from "./spec/schema.js";

const program = new Command();

program
  .name("autospec")
  .description(
    "A Socratic conversational agent that helps you create great project specs"
  )
  .version("0.1.0");

program
  .command("new")
  .description("Start a new spec conversation")
  .argument("<project-name>", "Name of the project to spec out")
  .option("-m, --model <model>", "Claude model to use", "claude-sonnet-4-20250514")
  .action(async (projectName: string, opts: { model: string }) => {
    const state = createConversation(projectName);
    await runRepl(state, opts.model);
  });

program
  .command("resume")
  .description("Resume an existing spec conversation")
  .option("-m, --model <model>", "Claude model to use", "claude-sonnet-4-20250514")
  .action(async (opts: { model: string }) => {
    const state = loadConversation();
    if (!state) {
      console.log(
        chalk.red(
          "No existing conversation found. Use `autospec new <name>` to start."
        )
      );
      process.exit(1);
    }
    console.log(
      chalk.green(`Resuming conversation for "${state.projectName}"`)
    );
    console.log(
      chalk.dim(
        `${state.messages.length} messages, phase: ${state.currentPhase}`
      )
    );
    await runRepl(state, opts.model);
  });

program
  .command("export")
  .description("Extract and save spec artifacts from the conversation")
  .option("-m, --model <model>", "Claude model to use", "claude-sonnet-4-20250514")
  .action(async (opts: { model: string }) => {
    const state = loadConversation();
    if (!state) {
      console.log(chalk.red("No conversation found."));
      process.exit(1);
    }
    console.log(chalk.blue("Extracting spec from conversation..."));
    const agent = new SocraticAgent({ model: opts.model });
    const project = await agent.extractSpec(state);
    if (!project) {
      console.log(chalk.red("Failed to extract spec."));
      process.exit(1);
    }
    const paths = saveSpecArtifacts(project);
    console.log(chalk.green("Spec artifacts saved:"));
    for (const p of paths) {
      console.log(chalk.dim(`  ${p}`));
    }
  });

program
  .command("status")
  .description("Show current conversation status")
  .action(() => {
    const state = loadConversation();
    if (!state) {
      console.log(chalk.red("No conversation found."));
      process.exit(1);
    }
    printStatus(state);
  });

async function runRepl(
  initialState: ConversationState,
  model: string
): Promise<void> {
  const agent = new SocraticAgent({ model });
  let state = initialState;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  printBanner(state);

  // If this is a fresh conversation, get the initial prompt from the agent
  if (state.messages.length === 0) {
    console.log(chalk.dim("\nStarting conversation...\n"));
    try {
      const result = await agent.respond(
        state,
        `I want to create a spec for a project called "${state.projectName}". Let's begin.`
      );
      state = result.state;
      printAssistant(result.response);
      saveConversation(state);
    } catch (err) {
      console.log(chalk.red(`Error: ${err}`));
    }
  }

  const prompt = () => {
    const phase = PHASES[state.currentPhase];
    rl.question(
      chalk.cyan(`\n[${phase.displayName}] You: `),
      async (input) => {
        const trimmed = input.trim();

        if (!trimmed) {
          prompt();
          return;
        }

        // Handle local commands
        if (trimmed === "/quit" || trimmed === "/exit") {
          saveConversation(state);
          console.log(chalk.green("\nConversation saved. Goodbye!"));
          rl.close();
          return;
        }

        if (trimmed === "/status") {
          printStatus(state);
          prompt();
          return;
        }

        if (trimmed === "/save") {
          const path = saveConversation(state);
          console.log(chalk.green(`Saved to ${path}`));
          prompt();
          return;
        }

        if (trimmed === "/export") {
          console.log(chalk.blue("\nExtracting spec..."));
          try {
            const project = await agent.extractSpec(state);
            if (project) {
              const paths = saveSpecArtifacts(project);
              console.log(chalk.green("Spec artifacts saved:"));
              for (const p of paths) {
                console.log(chalk.dim(`  ${p}`));
              }
            } else {
              console.log(
                chalk.yellow(
                  "Could not extract spec yet — keep the conversation going."
                )
              );
            }
          } catch (err) {
            console.log(chalk.red(`Export error: ${err}`));
          }
          prompt();
          return;
        }

        if (trimmed === "/help") {
          printHelp();
          prompt();
          return;
        }

        // Send to agent
        try {
          console.log(chalk.dim("\nThinking..."));
          const result = await agent.respond(state, trimmed);
          state = result.state;
          printAssistant(result.response);
          saveConversation(state);
        } catch (err) {
          console.log(chalk.red(`Error: ${err}`));
        }

        prompt();
      }
    );
  };

  prompt();
}

function printBanner(state: ConversationState): void {
  console.log("");
  console.log(
    chalk.bold.blue("╔══════════════════════════════════════════╗")
  );
  console.log(
    chalk.bold.blue("║          autospec — Socratic Specs       ║")
  );
  console.log(
    chalk.bold.blue("╚══════════════════════════════════════════╝")
  );
  console.log("");
  console.log(chalk.white(`  Project: ${chalk.bold(state.projectName)}`));
  console.log(
    chalk.white(
      `  Phase:   ${chalk.bold(PHASES[state.currentPhase].displayName)}`
    )
  );
  console.log("");
  console.log(chalk.dim("  Phases: " + PHASE_ORDER.map((p) => {
    const info = PHASES[p];
    return p === state.currentPhase
      ? chalk.bold.underline(info.displayName)
      : info.displayName;
  }).join(" → ")));
  console.log("");
  console.log(chalk.dim('  Type /help for commands, /quit to exit'));
}

function printAssistant(response: string): void {
  console.log("");
  console.log(chalk.green.bold("Agent: ") + response);
}

function printStatus(state: ConversationState): void {
  console.log("");
  console.log(chalk.bold(`Project: ${state.projectName}`));
  console.log(chalk.bold(`Phase: ${PHASES[state.currentPhase].displayName}`));
  console.log(chalk.bold(`Messages: ${state.messages.length}`));
  console.log("");
  for (const phase of PHASE_ORDER) {
    const count = state.messages.filter(
      (m) => m.phase === phase && m.role === "user"
    ).length;
    const isCurrent = phase === state.currentPhase;
    const marker = isCurrent ? "→" : " ";
    const info = PHASES[phase];
    console.log(
      `  ${marker} ${info.displayName.padEnd(10)} ${count} turns${
        isCurrent ? chalk.yellow(" (active)") : ""
      }`
    );
  }
}

function printHelp(): void {
  console.log("");
  console.log(chalk.bold("Commands:"));
  console.log("  /next       — Advance to the next phase");
  console.log("  /phase <n>  — Jump to a specific phase (explore|challenge|clarify|specify|refine)");
  console.log("  /status     — Show conversation status");
  console.log("  /export     — Extract and save spec artifacts");
  console.log("  /save       — Save conversation to disk");
  console.log("  /help       — Show this help");
  console.log("  /quit       — Save and exit");
}

program.parse();
