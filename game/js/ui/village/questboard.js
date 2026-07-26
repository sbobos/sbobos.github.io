import { story } from "../../state.js";
import { BOSSES } from "../../data/monsters/bosses.js";
import { ARENAS } from "../../data/arenas.js";
import { MISSIONS } from "../../data/missions.js";
import { registerMission } from "../../questregistry.js";
import { renderVillage } from "../village.js";

/* ---------- QUEST BOARD STATE ----------
   Side-hunt picks are cached per story/chapter key so switching tabs and
   back doesn't reroll the board. refreshQuestBoard() is the only way to
   force a reroll (e.g. after a save load or new game).
*/
let cachedEntries = null;
let cachedBoardKey = null;

export function getActiveStoryMission() {
  return (
    MISSIONS.find(
      (m) => m.category === "main" && m.key === story.activeMissionKey,
    ) || MISSIONS.find((m) => m.category === "main")
  );
}

export function refreshQuestBoard() {
  cachedEntries = null;
  renderVillage();
}

export function getQuestBoardEntries() {
  const activeMission = getActiveStoryMission();
  const boardKey = `${activeMission.key}:${story.chapter}`;

  if (cachedEntries && cachedBoardKey === boardKey) {
    return cachedEntries;
  }

  const entries = [];

  registerMission(activeMission);

  entries.push({
    type: "main",
    mission: activeMission,
    monster: BOSSES[activeMission.monsterId],
    label: "Main Assignment",
  });

  const sidePool = MISSIONS.filter(
    (m) =>
      m.category === "side" &&
      m.unlockChapter <= story.chapter &&
      !story.completedMissionKeys.includes(m.key),
  );

  const shuffled = [...sidePool].sort(() => Math.random() - 0.5);
  const limit = Math.min(2, shuffled.length);

  for (let i = 0; i < limit; i++) {
    const mission = shuffled[i];
    const monster = BOSSES[mission.monsterId];

    registerMission(mission);

    entries.push({
      type: "side",
      mission,
      monster,
      label: "Side Hunt",
    });
  }

  cachedEntries = entries;
  cachedBoardKey = boardKey;

  return entries;
}

export function renderQuestsTab() {
  const activeMission = getActiveStoryMission();
  const questCards = getQuestBoardEntries()
    .map((entry) => {
      const monster = entry.monster;
      const mission = entry.mission;
      const actionLabel =
        entry.type === "main" ? "Take assignment" : "Accept hunt";
      const subtitle =
        entry.type === "main"
          ? `${activeMission.description}`
          : mission.description || "A fresh lead has surfaced nearby.";
      return `
      <div class="card quest-card">
        <div><span class="qicon">${monster.icon}</span><span class="qname">${monster.name}</span></div>
        <div class="qflavor">${monster.flavor}</div>
        <div class="qarena">Territory: ${ARENAS[monster.arenaKey].name}</div>
        <div class="story-pill">${entry.label}</div>
        <div class="story-subtitle">${subtitle}</div>
        <button class="primary wide" onclick="startExpedition('${mission.key}')">${actionLabel}</button>
      </div>
    `;
    })
    .join("");

  return `
    <div class="panel">
      <h2>Quest Board</h2>
      <p class="section-copy">Your current assignment is the core of the story. The rest of the board shifts as the region opens up.</p>
      <div class="story-banner">
        <div class="story-title">Story progress</div>
        <div class="story-copy">Chapter ${story.chapter} · ${activeMission.title}</div>
        <div class="story-copy">${activeMission.description}</div>
      </div>
      <div class="quest-grid">${questCards}</div>
    </div>
  `;
}
