import { MISSIONS } from "../data/missions.js";
import { ENCOUNTERS } from "../data/encounters.js";
import { startHunt } from "./setup.js";
import { renderEncounter, setEncounterHandler } from "../ui/expedition.js";
import { renderVillage, refreshQuestBoard } from "../ui/village.js";
import { hunt, player } from "../state.js";
import { addMat, clamp, rollLoot } from "../utils.js";
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

      player.stamina = clamp(
        player.stamina - encounter.staminaCost,
        0,
        player.maxStamina,
      );

      const rewards = gatherFromTable(LOOT_TABLES.foraging.dunes);

      let text =
        `Spent ${encounter.staminaCost} stamina.\n\n` + rewardText(rewards);

      if (encounter.injury && Math.random() * 100 < encounter.injury.chance) {
        player.hp = clamp(player.hp - encounter.injury.damage, 0, player.maxHp);

        text += `\n\nYou were scratched while gathering (-${encounter.injury.damage} HP).`;
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

      player.stamina = clamp(
        player.stamina - encounter.staminaCost,
        0,
        player.maxStamina,
      );

      const rewards = gatherFromTable(LOOT_TABLES.mining.dunes);

      finishEncounterWithText(
        encounter.title,
        `Spent ${encounter.staminaCost} stamina.\n\n${rewardText(rewards)}`,
      );

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
      } else {
        finishEncounterWithText(encounter.title, "You decide not to rest.");
      }

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
        { label: "Mine", action: "mine" },
        { label: "Leave", action: "leave" },
      ];

    case "foraging":
      return [
        { label: "Gather", action: "gather" },
        { label: "Leave", action: "leave" },
      ];

    case "battle":
      return [
        { label: "Fight", action: "fight" },
        { label: "Retreat", action: "leave" },
      ];

    case "event":
      return [{ label: "Continue", action: "continue" }];

    case "rest":
      return [
        { label: "Rest", action: "rest" },
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
