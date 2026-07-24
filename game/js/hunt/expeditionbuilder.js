import { ARENA_FILLER_NODES } from "../data/arenanodes.js";

export function pickRandomFillerNodes(arena, min = 1, max = 3) {
  const pool = ARENA_FILLER_NODES[arena] ?? [];

  if (pool.length === 0) {
    console.warn(`No filler nodes defined for arena: ${arena}`);
    return [];
  }

  const count = min + Math.floor(Math.random() * (max - min + 1));
  const picks = [];

  for (let i = 0; i < count; i++) {
    picks.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return picks;
}

export function expandExpedition(rawExpedition) {
  const expanded = [];

  for (const step of rawExpedition) {
    if (typeof step === "object" && step.node === "random_fill") {
      expanded.push(
        ...pickRandomFillerNodes(step.arena, step.min ?? 1, step.max ?? 3),
      );
    } else {
      expanded.push(step);
    }
  }

  return expanded;
}
