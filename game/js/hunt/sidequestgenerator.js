import { BOSSES } from "../data/monsters/bosses.js";
import { SMALL_MONSTERS } from "../data/monsters/smallmonsters.js";
import { pickRandomFillerNodes } from "./expeditionbuilder.js";

let counter = 0;

export function generateSideExpedition(bossId, arena, rank = "normal") {
  const steps = pickRandomFillerNodes(arena, 1, 3);

  steps.push({ node: "boss_encounter", monsters: [bossId] });

  counter += 1;

  return {
    key: `random_${bossId}_${Date.now()}_${counter}`,
    title: `Hunt: ${BOSSES[bossId]?.name ?? SMALL_MONSTERS[bossId]?.name ?? bossId}`,
    monsterId: bossId,
    rank,
    generated: true,
    expedition: steps,
  };
}