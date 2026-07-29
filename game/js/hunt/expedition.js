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

let currentMission = null;
let step = 0;
let currentEncounter = null;

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

      const rewards = gatherFromTable(LOOT_TABLES.foraging.dunes, rolls);

      let text = `Spent ${cost} stamina.\n\n` + rewardText(rewards);

      if (injury && Math.random() * 100 < injuryChance(injury.chance)) {
        player.hp = clamp(player.hp - injury.damage, 0, player.maxHp);

        text += `\n\nYou were scratched while gathering (-${injury.damage} HP).`;
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

      const rewards = gatherFromTable(LOOT_TABLES.mining.dunes, rolls);

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

        text += `\n\nA support beam gives way (-${encounter.deepInjury.damage} HP).`;
      }

      finishEncounterWithText(encounter.title, text);

      return;
    }

    case "battle": {
      if (action === "leave") {
        finishEncounterWithText(encounter.title, "You avoid the monsters.");
        return;
      }

      startSmallMonsterFight(encounter.monster, finishEncounter);

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
            startSmallMonsterFight(
              encounter.ambushMonster ?? "boarling",
              finishEncounter,
            );

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

          startSmallMonsterFight(
            encounter.ambushMonster ?? "boarling",
            finishEncounter,
          );

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
    case "mining":
      return [
        { label: "Careful Dig", action: "mine" },
        { label: "Dig Deeper", action: "mine_deep" },
        { label: "Leave", action: "leave" },
      ];

    case "foraging":
      return [
        { label: "Quick Gather", action: "gather" },
        { label: "Forage Thoroughly", action: "gather_deep" },
        { label: "Leave", action: "leave" },
      ];

    case "battle":
      return [
        { label: "Fight", action: "fight" },
        { label: "Retreat", action: "leave" },
      ];

    case "event":
      if (encounter.event === "merchant") {
        return [
          {
            label: `Buy Potion (${encounter.potionPrice ?? 15}g)`,
            action: "buy_potion",
          },
          {
            label: `Buy Rations (${encounter.rationsPrice ?? 10}g)`,
            action: "buy_rations",
          },
          { label: "Move On", action: "leave" },
        ];
      }

      if (encounter.event === "lost_hunter") {
        return [
          { label: "Escort Them", action: "escort" },
          { label: "Point the Way", action: "direct" },
          { label: "Ignore", action: "leave" },
        ];
      }

      return [{ label: "Continue", action: "continue" }];

    case "rest":
      return [
        { label: "Short Rest", action: "rest" },
        { label: "Full Rest", action: "rest_full" },
        { label: "Continue", action: "leave" },
      ];

    default:
      return [{ label: "Continue", action: "continue" }];
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
