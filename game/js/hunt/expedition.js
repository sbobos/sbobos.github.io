import { MISSIONS } from "../data/missions.js";
import { ENCOUNTERS } from "../data/encounters.js";
import { startHunt } from "./setup.js";
import { renderEncounter, setEncounterHandler } from "../ui/expedition.js";
import { renderVillage, refreshQuestBoard } from "../ui/village.js";
import { hunt, player } from "../state.js";
import { addMat, clamp, rollLoot, getArmorStats } from "../utils.js";
import { LOOT_TABLES } from "../data/loot.js";
import { smallMonsterToHuntShape } from "./monsteradapter.js";
import { getRegisteredMission, unregisterMission } from "../questregistry.js";
import { expandExpedition } from "./expeditionbuilder.js";
import { advanceDay } from "./day.js";
import { BOSSES } from "../data/monsters/bosses.js";
import { SMALL_MONSTERS } from "../data/monsters/smallmonsters.js";

let currentMission = null;
let step = 0;
let currentEncounter = null;

// Helper: Get current arena key (defaults to 'dunes')
function getArenaKey() {
  if (currentMission?.arena) return currentMission.arena;

  // Fallback: derive arena from target boss monster
  if (currentMission?.monsterId && BOSSES[currentMission.monsterId]) {
    return BOSSES[currentMission.monsterId].arenaKey;
  }

  return "dunes";
}

// Helper: Pick an arena-appropriate small monster
function getSmallMonsterForArena(arenaKey) {
  const match = Object.values(SMALL_MONSTERS).find(
    (m) => m.arena === arenaKey
  );
  return match ? match.id : "boarling";
}

/**
 * Flat progress snapshot for the trail strip UI. No fog of war — every
 * node's type is revealed upfront, including the boss node, so the whole
 * path is visible from the first encounter screen.
 */
export function getExpeditionProgress() {
  const nodes = currentMission.expedition.map((eventDef) => {
    const eventKey = typeof eventDef === "string" ? eventDef : eventDef.node;
    const encounter = ENCOUNTERS[eventKey];

    return { type: encounter?.type ?? "event" };
  });

  return { nodes, step };
}

export function startExpedition(missionKey) {
  const rawMission =
    getRegisteredMission(missionKey) ??
    MISSIONS.find((m) => m.key === missionKey);

  if (!rawMission) {
    console.error(`Unknown mission: ${missionKey}`);
    return;
  }

  currentMission = {
    ...rawMission,
    expedition: expandExpedition(rawMission.expedition),
  };

  step = 0;

  nextExpeditionEvent();
}

function nextExpeditionEvent() {
  const eventDef = currentMission.expedition[step];

  const eventKey = typeof eventDef === "string" ? eventDef : eventDef.node;
  const overrideMonsters =
    typeof eventDef === "string" ? null : eventDef.monsters;

  currentEncounter = ENCOUNTERS[eventKey];

  if (!currentEncounter) {
    console.error(`Unknown expedition node: ${eventKey}`);
    return;
  }

  if (currentEncounter.type === "boss") {
    const queue = overrideMonsters ??
      currentEncounter.monsters ?? [currentEncounter.monster];
    startMonsterQueue(
      queue,
      currentMission.key,
      currentMission.rank,
      finishEncounter,
    );
    return;
  }

  showEncounter(currentEncounter);
}

function startMonsterQueue(queue, missionKey, rank, onQueueDone) {
  const [head, ...rest] = queue;

  startHunt(head, missionKey, rank, () => {
    if (rest.length === 0) {
      onQueueDone();
    } else {
      startMonsterQueue(rest, missionKey, rank, onQueueDone);
    }
  });
}

function showEncounter(encounter) {
  const buttons = getButtons(encounter);

  renderEncounter(encounter, buttons, getExpeditionProgress());

  setEncounterHandler((choice) => {
    resolveEncounter(encounter, buttons[choice].action);
  });
}

function finishEncounter() {
  step++;

  if (step >= currentMission.expedition.length) {
    returnToCamp();
    return;
  }

  nextExpeditionEvent();
}

/**
 * Armor def shaves down injury odds on risky actions (deep dig, thorough
 * forage, etc) — a small, generic stat check rather than a dedicated
 * "luck" or "skill" stat we don't have yet. Floor/ceiling keep it from
 * ever hitting 0% (always some risk) or over 95%.
 */
function injuryChance(baseChance) {
  const { def } = getArmorStats();
  return clamp(baseChance - def * 0.5, 2, 95);
}

function resolveEncounter(encounter, action) {
  const arenaKey = getArenaKey();

  switch (encounter.type) {
    case "foraging": {
      if (action === "leave") {
        finishEncounterWithText(
          encounter.title,
          "You decide to leave the plants untouched.",
        );
        return;
      }

      const deep = action === "gather_deep";
      const cost = deep
        ? (encounter.deepStaminaCost ?? encounter.staminaCost * 2)
        : encounter.staminaCost;
      const rolls = deep ? 4 : 2;
      const injury = deep ? encounter.deepInjury : encounter.injury;

      player.stamina = clamp(player.stamina - cost, 0, player.maxStamina);

      // DYNAMIC: Pull from LOOT_TABLES.foraging[arenaKey]
      const lootTable = LOOT_TABLES.foraging[arenaKey] ?? LOOT_TABLES.foraging.dunes;
      const rewards = gatherFromTable(lootTable, rolls);

      let text = `Spent ${cost} stamina.\n\n` + rewardText(rewards);

      if (injury && Math.random() * 100 < injuryChance(injury.chance)) {
        player.hp = clamp(player.hp - injury.damage, 0, player.maxHp);
        text += `\n\nYou were injured while gathering (-${injury.damage} HP).`;
      }

      finishEncounterWithText(encounter.title, text);
      return;
    }

    case "mining": {
      if (action === "leave") {
        finishEncounterWithText(
          encounter.title,
          "You continue down the trail.",
        );
        return;
      }

      const deep = action === "mine_deep";
      const cost = deep
        ? (encounter.deepStaminaCost ?? encounter.staminaCost * 2)
        : encounter.staminaCost;
      const rolls = deep ? 4 : 2;

      player.stamina = clamp(player.stamina - cost, 0, player.maxStamina);

      // DYNAMIC: Pull from LOOT_TABLES.mining[arenaKey]
      const lootTable = LOOT_TABLES.mining[arenaKey] ?? LOOT_TABLES.mining.dunes;
      const rewards = gatherFromTable(lootTable, rolls);

      let text = `Spent ${cost} stamina.\n\n${rewardText(rewards)}`;

      if (
        deep &&
        encounter.deepInjury &&
        Math.random() * 100 < injuryChance(encounter.deepInjury.chance)
      ) {
        player.hp = clamp(
          player.hp - encounter.deepInjury.damage,
          0,
          player.maxHp,
        );
        text += `\n\nA rockfall strikes you (-${encounter.deepInjury.damage} HP).`;
      }

      finishEncounterWithText(encounter.title, text);
      return;
    }

    case "battle": {
      if (action === "leave") {
        finishEncounterWithText(encounter.title, "You avoid the monsters.");
        return;
      }

      // DYNAMIC: Small monster selected by arena
      const monsterKey = encounter.monster || getSmallMonsterForArena(arenaKey);
      startSmallMonsterFight(monsterKey, finishEncounter);
      return;
    }

    case "event": {
      if (encounter.event === "merchant") {
        if (action === "buy_potion") {
          const price = encounter.potionPrice ?? 15;

          if (player.goldcoin >= price) {
            player.goldcoin -= price;
            player.potions += 1;

            finishEncounterWithText(
              encounter.title,
              `Bought a potion for ${price} gold.`,
            );
          } else {
            finishEncounterWithText(
              encounter.title,
              "You don't have enough gold for that.",
            );
          }

          return;
        }

        if (action === "buy_rations") {
          const price = encounter.rationsPrice ?? 10;
          const staminaGain = encounter.rationsStamina ?? 20;

          if (player.goldcoin >= price) {
            player.goldcoin -= price;
            player.stamina = clamp(
              player.stamina + staminaGain,
              0,
              player.maxStamina,
            );

            finishEncounterWithText(
              encounter.title,
              `Bought rations for ${price} gold.\nRecovered ${staminaGain} stamina.`,
            );
          } else {
            finishEncounterWithText(
              encounter.title,
              "You don't have enough gold for that.",
            );
          }

          return;
        }

        finishEncounterWithText(encounter.title, "You move on down the trail.");

        return;
      }

      if (encounter.event === "lost_hunter") {
        if (action === "escort") {
          const cost = encounter.escortStaminaCost ?? 10;
          player.stamina = clamp(player.stamina - cost, 0, player.maxStamina);

          const ambushChance = encounter.ambushChance ?? 0;
          if (ambushChance && Math.random() * 100 < ambushChance) {
            // DYNAMIC: Ambush monster selected by arena
            const ambushMonster = getSmallMonsterForArena(arenaKey);
            startSmallMonsterFight(ambushMonster, finishEncounter);
            return;
          }

          const rewardChance = encounter.escortRewardChance ?? 50;

          if (Math.random() * 100 < rewardChance) {
            const reward = encounter.escortRewardGold ?? 20;

            player.goldcoin += reward;

            finishEncounterWithText(
              encounter.title,
              `You guide them to safety. They thank you with ${reward} gold.`,
            );
          } else {
            finishEncounterWithText(
              encounter.title,
              "You guide them to safety, though they have little to offer in return.",
            );
          }

          return;
        }

        if (action === "direct") {
          const reward = encounter.aloneReward ?? 10;

          player.goldcoin += reward;

          finishEncounterWithText(
            encounter.title,
            `You point them in the right direction. They leave you ${reward} gold for the help.`,
          );

          return;
        }

        finishEncounterWithText(
          encounter.title,
          "You leave them to find their own way.",
        );

        return;
      }

      finishEncounterWithText(encounter.title, "The encounter passes.");

      return;
    }

    case "rest": {
      if (action === "rest") {
        player.hp = clamp(player.hp + encounter.heal, 0, player.maxHp);

        player.stamina = clamp(
          player.stamina + encounter.stamina,
          0,
          player.maxStamina,
        );

        finishEncounterWithText(
          encounter.title,
          `Recovered ${encounter.heal} HP.\nRecovered ${encounter.stamina} stamina.`,
        );

        return;
      }

      if (action === "rest_full") {
        const ambushChance = encounter.ambushChance ?? 0;
        if (ambushChance && Math.random() * 100 < ambushChance) {
          const partialHeal = Math.round(
            (encounter.fullHeal ?? encounter.heal * 2) / 2,
          );
          player.hp = clamp(player.hp + partialHeal, 0, player.maxHp);

          // DYNAMIC: Rest ambush monster selected by arena
          const ambushMonster = getSmallMonsterForArena(arenaKey);
          startSmallMonsterFight(ambushMonster, finishEncounter);
          return;
        }

        const heal = encounter.fullHeal ?? encounter.heal * 2;
        const stamina = encounter.fullStamina ?? encounter.stamina * 2;

        player.hp = clamp(player.hp + heal, 0, player.maxHp);
        player.stamina = clamp(player.stamina + stamina, 0, player.maxStamina);

        finishEncounterWithText(
          encounter.title,
          `Recovered ${heal} HP.\nRecovered ${stamina} stamina.`,
        );

        return;
      }

      finishEncounterWithText(encounter.title, "You decide not to rest.");

      return;
    }

    default:
      finishEncounterWithText(encounter.title, "Nothing happened.");
  }
}

function getButtons(encounter) {
  switch (encounter.type) {
    case "mining": {
      const staminaCost = encounter.staminaCost ?? 8;
      const deepStaminaCost = encounter.deepStaminaCost ?? staminaCost * 2;
      const deepInjuryChance = encounter.deepInjury
        ? injuryChance(encounter.deepInjury.chance)
        : 0;
      const deepInjuryDmg = encounter.deepInjury?.damage ?? 0;

      return [
        {
          label: "Careful Dig",
          action: "mine",
          tooltip: `⚡ -${staminaCost} Stamina | ⛏️ 2 Loot Rolls`,
        },
        {
          label: "Dig Deeper",
          action: "mine_deep",
          tooltip: `⚡ -${deepStaminaCost} Stamina | ⛏️ 4 Loot Rolls | ⚠️ ${deepInjuryChance}% Risk (-${deepInjuryDmg} HP)`,
        },
        { label: "Leave", action: "leave", tooltip: "Pass without mining." },
      ];
    }

    case "foraging": {
      const staminaCost = encounter.staminaCost ?? 2;
      const deepStaminaCost = encounter.deepStaminaCost ?? staminaCost * 2;
      const normalInjury = encounter.injury;
      const normalRisk = normalInjury ? injuryChance(normalInjury.chance) : 0;
      const deepInjury = encounter.deepInjury;
      const deepRisk = deepInjury ? injuryChance(deepInjury.chance) : 0;

      return [
        {
          label: "Quick Gather",
          action: "gather",
          tooltip: `⚡ -${staminaCost} Stamina | 🌿 2 Loot Rolls${
            normalRisk ? ` | ⚠️ ${normalRisk}% Risk (-${normalInjury.damage} HP)` : ""
          }`,
        },
        {
          label: "Forage Thoroughly",
          action: "gather_deep",
          tooltip: `⚡ -${deepStaminaCost} Stamina | 🌿 4 Loot Rolls${
            deepRisk ? ` | ⚠️ ${deepRisk}% Risk (-${deepInjury.damage} HP)` : ""
          }`,
        },
        { label: "Leave", action: "leave", tooltip: "Leave herbs behind." },
      ];
    }

    case "battle":
      return [
        {
          label: "Fight",
          action: "fight",
          tooltip: "⚔️ Engage hostiles in combat.",
        },
        {
          label: "Retreat",
          action: "leave",
          tooltip: "Safely slip past without fighting.",
        },
      ];

    case "event":
      if (encounter.event === "merchant") {
        const potionPrice = encounter.potionPrice ?? 15;
        const rationsPrice = encounter.rationsPrice ?? 10;
        const staminaGain = encounter.rationsStamina ?? 20;

        return [
          {
            label: `Buy Potion (${potionPrice}g)`,
            action: "buy_potion",
            tooltip: `💰 -${potionPrice} Gold | 🧪 +1 Potion`,
          },
          {
            label: `Buy Rations (${rationsPrice}g)`,
            action: "buy_rations",
            tooltip: `💰 -${rationsPrice} Gold | ⚡ +${staminaGain} Stamina`,
          },
          { label: "Move On", action: "leave", tooltip: "Leave shop." },
        ];
      }

      if (encounter.event === "lost_hunter") {
        const escortStamina = encounter.escortStaminaCost ?? 10;
        const rewardChance = encounter.escortRewardChance ?? 50;
        const rewardGold = encounter.escortRewardGold ?? 20;
        const ambushChance = encounter.ambushChance ?? 0;
        const aloneGold = encounter.aloneReward ?? 10;

        return [
          {
            label: "Escort Them",
            action: "escort",
            tooltip: `⚡ -${escortStamina} Stamina | 💰 ${rewardChance}% Chance (+${rewardGold}g)${
              ambushChance ? ` | ⚔️ ${ambushChance}% Ambush` : ""
            }`,
          },
          {
            label: "Point the Way",
            action: "direct",
            tooltip: `💰 +${aloneGold} Gold | No risks`,
          },
          { label: "Ignore", action: "leave", tooltip: "Leave hunter behind." },
        ];
      }

      return [{ label: "Continue", action: "continue", tooltip: "Proceed along trail." }];

    case "rest": {
      const heal = encounter.heal ?? 20;
      const stamina = encounter.stamina ?? 25;
      const fullHeal = encounter.fullHeal ?? heal * 2;
      const fullStamina = encounter.fullStamina ?? stamina * 2;
      const ambushChance = encounter.ambushChance ?? 0;

      return [
        {
          label: "Short Rest",
          action: "rest",
          tooltip: `❤️ +${heal} HP | ⚡ +${stamina} Stamina`,
        },
        {
          label: "Full Rest",
          action: "rest_full",
          tooltip: `❤️ +${fullHeal} HP | ⚡ +${fullStamina} Stamina${
            ambushChance ? ` | ⚔️ ${ambushChance}% Ambush` : ""
          }`,
        },
        { label: "Continue", action: "leave", tooltip: "Skip resting." },
      ];
    }

    default:
      return [{ label: "Continue", action: "continue", tooltip: "Proceed along trail." }];
  }
}

export function continueExpedition() {
  if (hunt.result !== "victory") {
    returnToCamp();
    return;
  }

  if (hunt.afterHunt) {
    hunt.afterHunt();
  } else {
    returnToCamp();
  }
}

function returnToCamp() {
  if (hunt?.missionKey) {
    const mission = getRegisteredMission(hunt.missionKey);

    if (mission?.category === "side") {
      unregisterMission(mission.key);
      refreshQuestBoard();
    }
  }

  advanceDay();
  player.hp = player.maxHp;
  player.stamina = player.maxStamina;
  renderVillage();
}

function finishEncounterWithText(title, text) {
  renderEncounter(
    { title, text },
    [{ label: "Continue", action: "continue" }],
    getExpeditionProgress(),
  );

  setEncounterHandler(() => {
    finishEncounter();
  });
}

function gatherFromTable(table, rolls = 2) {
  const rewards = {};

  for (let i = 0; i < rolls; i++) {
    const item = rollLoot(table);

    rewards[item] = (rewards[item] || 0) + 1;

    addMat(item, 1);
  }

  return rewards;
}

function rewardText(rewards) {
  return Object.entries(rewards)
    .map(([item, amount]) => `${item} ×${amount}`)
    .join("\n");
}

function startSmallMonsterFight(monsterKey, onDone) {
  startHunt(smallMonsterToHuntShape(monsterKey), null, "normal", onDone);
}
