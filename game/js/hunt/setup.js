import { hunt, player, story, setHunt } from "../state.js";
import { BOSSES } from "../data/monsters/bosses.js";
import { ARENAS } from "../data/arenas.js";
import { RANKS } from "../data/ranks.js";
import { MISSIONS } from "../data/missions.js";
import { logMsg } from "./log.js";
import { randInt, addMat, rollLoot } from "../utils.js";
import { renderHunt } from "../ui/hunt.js";
import { LOOT_TABLES } from "../data/loot.js";
import { getRegisteredMission, unregisterMission } from "../questregistry.js";
import { refreshQuestBoard } from "../ui/village.js";
import { advanceDay } from "./day.js";

/* ---------- HUNT SETUP ---------- */

export function startHunt(
  monsterRef,
  missionKey,
  rank = "normal",
  afterHunt = null,
) {
  const template =
    typeof monsterRef === "string" ? BOSSES[monsterRef] : monsterRef;

  if (!template) {
    console.error(`Unknown monster: ${monsterRef}`);
    return;
  }

  const monster = JSON.parse(JSON.stringify(template));
  const scale = RANKS[rank] ?? RANKS.normal;
  monster.maxHp = Math.round(monster.maxHp * scale.hp);
  monster.hp = monster.maxHp;
  monster.enraged = false;
  monster.parts.forEach((p) => {
    p.hp = p.maxHp;
    p.broken = false;
  });

  setHunt({
    monster,
    rank,
    pendingMove: null,
    turnCount: 0,
    sandstormActive: false,
    playerGuardedThisRound: false,
    recoveryWindow: false,
    log: [],
    over: false,
    missionKey,
    afterHunt,
  });

  const arena = ARENAS[monster.arenaKey];
  logMsg(
    `You track the ${monster.name} into ${arena.name}. ${arena.desc}`,
    "l-sys",
  );
  renderHunt();
}

export function endHunt(result) {
  hunt.over = true;
  hunt.result = result;
  let rewardsHtml = "";

  player.stats.hunts += 1;
  advanceDay();
  if (hunt.missionKey && result === "victory") {
    const mission = getRegisteredMission(hunt.missionKey);

    if (mission && !story.completedMissionKeys.includes(hunt.missionKey)) {
      story.completedMissionKeys.push(hunt.missionKey);

      if (mission.category === "main") {
        const nextMission = MISSIONS.find(
          (m) => m.category === "main" && m.chapter === mission.chapter + 1,
        );

        if (nextMission) {
          story.unlockedMissionKeys.push(nextMission.key);
          story.activeMissionKey = nextMission.key;
          story.chapter = Math.max(story.chapter, nextMission.chapter);
        }
      }

      if (mission.category === "side") {
        unregisterMission(mission.key);
        refreshQuestBoard();
      }
    }
  }
  if (result === "victory") player.stats.victories += 1;
  else if (result === "flee") player.stats.fled += 1;
  else if (result === "defeat") player.stats.defeats += 1;

  if (result === "victory") {
    player.trophies[hunt.monster.id] =
      (player.trophies[hunt.monster.id] || 0) + 1;
    const loot = {};
    hunt.monster.parts.forEach((p) => {
      if (p.broken && p.rewards.length > 0) {
        const pick = p.rewards[randInt(0, p.rewards.length - 1)];
        loot[pick] = (loot[pick] || 0) + 1;
      }
    });
    const carveTable =
      LOOT_TABLES.carving[hunt.monster.id]?.[hunt.rank] ??
      LOOT_TABLES.carving.smallMonster?.[hunt.monster.id];

    for (let i = 0; i < 3; i++) {
      const pick = rollLoot(carveTable);

      loot[pick] = (loot[pick] || 0) + 1;
    }
    const goldcoinGain = randInt(
      hunt.monster.goldcoinRange[0],
      hunt.monster.goldcoinRange[1],
    );
    Object.entries(loot).forEach(([n, c]) => addMat(n, c));
    player.goldcoin += goldcoinGain;

    rewardsHtml = `
      <h3>Hunt successful</h3>
      <p style="font-size:13px;color:var(--text-dim);">The ${hunt.monster.name} has been felled. You carve what you can before it's claimed by the terrain.</p>
      <div class="loot-grid">
        ${Object.entries(loot)
          .map(
            ([n, c]) =>
              `<div class="loot-item">${n} <span style="color:var(--gold);float:right;">x${c}</span></div>`,
          )
          .join("")}
        <div class="loot-item">goldcoin <span style="color:var(--gold);float:right;">+${goldcoinGain}</span></div>
      </div>
    `;
  } else if (result === "defeat") {
    rewardsHtml = `
      <h3>You were carried back to camp</h3>
      <p style="font-size:13px;color:var(--text-dim);">The ${hunt.monster.name} proved too much this time. No materials recovered — rest up and try again.</p>
    `;
  } else {
    rewardsHtml = `
      <h3>You withdrew from the hunt</h3>
      <p style="font-size:13px;color:var(--text-dim);">Sometimes the wiser hunter lives to track another day.</p>
    `;
  }

  const h = document.getElementById("hunt-screen");
  h.innerHTML += `<div class="overlay">${rewardsHtml}<button class="primary" style="margin-top:10px;" onclick="continueExpedition()">Continue</button></div>`;
}
