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

   selectedQuestIndex mirrors the same "render-persistent selection" pattern
   used by Forge's sub-tabs / Hunt's part selection — it lives at module
   scope here (rather than on a shared state object) since the quest board
   entries themselves are also module-scoped. It resets to 0 whenever the
   board rerolls, so a stale index never points past the new entry list.
*/
let cachedEntries = null;
let cachedBoardKey = null;
let selectedQuestIndex = 0;

export function getActiveStoryMission() {
  return (
    MISSIONS.find(
      (m) => m.category === "main" && m.key === story.activeMissionKey,
    ) || MISSIONS.find((m) => m.category === "main")
  );
}

export function refreshQuestBoard() {
  cachedEntries = null;
  selectedQuestIndex = 0;
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
    (m) => m.category === "side" && m.unlockChapter <= story.chapter,
  );
  const shuffled = [...sidePool].sort(() => Math.random() - 0.5);

  for (const mission of shuffled.slice(0, 2)) {
    registerMission(mission);

    entries.push({
      type: "side",
      mission,
      monster: BOSSES[mission.monsterId],
      label: "Side Hunt",
    });
  }

  cachedEntries = entries;
  cachedBoardKey = boardKey;

  return entries;
}

export function renderQuestsTab() {
  const activeMission = getActiveStoryMission();
  const entries = getQuestBoardEntries();

  if (selectedQuestIndex >= entries.length) {
    selectedQuestIndex = 0;
  }

  const listHtml = entries
    .map((entry, index) => {
      const monster = entry.monster;
      const active = index === selectedQuestIndex;

      return `
      <button class="gear-icon quest-list-item ${active ? "selected" : ""}"
              onclick="selectQuestItem(${index})">
        <span class="quest-list-icon">${monster.icon}</span>
        <div class="quest-list-name">${monster.name}</div>
        <div class="quest-list-label">${entry.label}</div>
      </button>
    `;
    })
    .join("");

  const detailHtml = renderQuestDetail(
    entries[selectedQuestIndex],
    activeMission,
  );

  return `
    <div class="panel">
      <h2>Quest Board</h2>
      <p class="section-copy">Your current assignment is the core of the story. The rest of the board shifts as the region opens up.</p>
      <div class="story-banner">
        <div class="story-title">Story progress</div>
        <div class="story-copy">Chapter ${story.chapter} · ${activeMission.title}</div>
        <div class="story-copy">${activeMission.description}</div>
      </div>
      <div class="quest-tab-layout">
        <div class="quest-list">${listHtml}</div>
        ${detailHtml}
      </div>
    </div>
  `;
}

function renderQuestDetail(entry, activeMission) {
  const monster = entry.monster;
  const mission = entry.mission;
  const arena = ARENAS[monster.arenaKey];
  const theme = arena.theme ?? { from: "#20201c", to: "var(--panel-alt)" };
  const actionLabel = entry.type === "main" ? "Take assignment" : "Accept hunt";
  const subtitle =
    entry.type === "main"
      ? activeMission.description
      : mission.description || "A fresh lead has surfaced nearby.";

  return `
    <div class="quest-detail-panel" style="--scene-from:${theme.from};--scene-to:${theme.to};">
      <div class="quest-detail-scene">
        <span class="quest-detail-icon">${monster.icon}</span>
        <div class="quest-detail-name">${monster.name}</div>
        <span class="story-pill">${entry.label}</span>
      </div>
      <div class="qflavor">${monster.flavor}</div>
      <div class="qarena">Territory: ${arena.name} — ${arena.desc}</div>
      <div class="story-subtitle">${subtitle}</div>
      <button class="primary wide" onclick="startExpedition('${mission.key}')">${actionLabel}</button>
    </div>
  `;
}

/**
 * Sets which quest entry the detail panel shows. Purely a selection —
 * doesn't accept the quest, doesn't call startExpedition — so switching
 * between the main assignment and side hunts to compare them is free.
 */
export function selectQuestItem(index) {
  selectedQuestIndex = index;
  renderVillage();
}
