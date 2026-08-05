import { hunt, player, story, setHunt } from "../state.js";
import { BOSSES } from "../data/monsters/bosses.js";
import { ARENAS } from "../data/arenas.js";
import { getRankScaling } from "../data/ranks.js";
import { MISSIONS } from "../data/missions.js";
import { logMsg } from "./log.js";
import { randInt, addMat, rollLoot } from "../utils.js";
import { renderHunt } from "../ui/hunt.js";
import { LOOT_TABLES } from "../data/loot.js";
import { getRegisteredMission, unregisterMission } from "../questregistry.js";
import { refreshQuestBoard } from "../ui/village.js";

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
  const scale = getRankScaling(template, rank);
  monster.maxHp = Math.round(monster.maxHp * scale.hpMult);
  monster.hp = monster.maxHp;
  monster.maxStamina = monster.maxStamina ?? 100;
  monster.stamina = monster.maxStamina;
  monster.isExhausted = false;
  monster.damageMult = scale.damageMult;
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
    selectedPartKey: null,
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

  if (hunt.missionKey && result === "victory") {
    const mission = getRegisteredMission(hunt.missionKey);

    if (mission) {
      if (
        mission.category === "main" &&
        !story.completedMissionKeys.includes(mission.key)
      ) {
        story.completedMissionKeys.push(mission.key);

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
      <h2 class="overlay-title victory">HUNT SUCCESSFUL</h2>
      <p style="font-size:12px;color:var(--text-dim);margin-bottom:12px;">The ${hunt.monster.name} has been felled. You carve what you can before it's claimed by the terrain.</p>
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
      <h2 class="overlay-title defeat">HUNT FAILED</h2>
      <p style="font-size:12px;color:var(--text-dim);margin-bottom:12px;">The ${hunt.monster.name} proved too much this time. No materials recovered — rest up and try again.</p>
    `;
  } else {
    rewardsHtml = `
      <h2 class="overlay-title">HUNT WITHDRAWN</h2>
      <p style="font-size:12px;color:var(--text-dim);margin-bottom:12px;">Sometimes the wiser hunter lives to track another day.</p>
    `;
  }

  // Save html onto state so renderHunt can render it cleanly as a modal
  hunt.rewardsHtml = rewardsHtml;

  // Re-render UI immediately so buttons lock and popup appears instantly!
  renderHunt();
}
