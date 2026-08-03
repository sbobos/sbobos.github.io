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

export function buildQuestTabs() {
  return [
    {
      key: "quests",
      label: "Assignments",

      render() {
        const activeMission = getActiveStoryMission();
        const entries = getQuestBoardEntries();

        if (selectedQuestIndex >= entries.length) {
          selectedQuestIndex = 0;
        }

        const cardsHtml = entries
          .map((entry, index) => {
            const monster = entry.monster;
            const mission = entry.mission;
            const active = index === selectedQuestIndex;
            const stars = mission.stars ?? 1;

            return `
              <button
                class="quest-card ${active ? "selected" : ""}"
                data-action="select-quest"
                data-key="${index}">
                <div class="quest-card-top">
                  <span class="quest-star">★${stars}</span>
                </div>
                <span class="quest-card-icon">${monster.icon}</span>
                <div class="quest-card-name">${mission.title}</div>
              </button>
            `;
          })
          .join("");

        return `
          <div class="story-banner">
            <div class="story-title">Story progress</div>
            <div class="story-copy">
              Chapter ${story.chapter} · ${activeMission.title}
            </div>
            <div class="story-copy">
              ${activeMission.description}
            </div>
          </div>

          <div class="detail-layout">
            <div class="detail-strip quest-grid">
              ${cardsHtml}
            </div>

            ${renderQuestDetail(entries[selectedQuestIndex], activeMission)}
          </div>
        `;
      },

      onAction(body, action, key, event, overlay) {
        if (action === "select-quest") {
          selectedQuestIndex = Number(key);
          overlay.refresh();
        } else if (action === "start-expedition") {
          // 1. Hide/unmount the overlay shell
          overlay.hide();

          // 2. Trigger the expedition scene
          startExpedition(key);
        }
      },
    },
  ];
}

function formatReward(mission, monster) {
  if (mission.rewards?.goldcoin) {
    return `${mission.rewards.goldcoin}g`;
  }
  const [lo, hi] = monster.goldcoinRange ?? [0, 0];
  return `~${Math.round((lo + hi) / 2)}g (est.)`;
}

function renderQuestDetail(entry, activeMission) {
  const monster = entry.monster;
  const mission = entry.mission;
  const arena = ARENAS[monster.arenaKey];
  const theme = arena.theme ?? { from: "#20201c", to: "var(--panel-alt)" };
  const actionLabel = entry.type === "main" ? "Take assignment" : "Accept hunt";
  const requestText =
    entry.type === "main"
      ? activeMission.description
      : mission.description || "A fresh lead has surfaced nearby.";

  return `
    <div class="detail-sidebar quest-detail-panel" style="--scene-from:${theme.from};--scene-to:${theme.to};">
      <div class="quest-detail-scene">
        <span class="quest-detail-icon">${monster.icon}</span>
        <div class="quest-detail-titles">
          <div class="quest-detail-title">${mission.title}</div>
          <div class="quest-detail-subtitle">Hunt the ${monster.name}</div>
        </div>
        <span class="story-pill">${entry.label}</span>
      </div>

      <div class="quest-info-strip">
        <span>${arena.name}</span>
        <span>${monster.timeOfDay ?? "Unknown"}</span>
        <span>Pop: ${monster.population ?? "Unknown"}</span>
      </div>

      <div class="quest-reward-line">
        <span class="quest-stat-label">Reward</span>
        <span class="quest-stat-value">${formatReward(mission, monster)}</span>
      </div>

      <div class="quest-client-block">
        <div class="quest-conditions-label">Client: ${mission.client ?? "Unknown"}</div>
        <p class="section-copy">${requestText}</p>
      </div>

      <button class="primary wide" data-action="start-expedition" data-key="${mission.key}">
  ${actionLabel}
</button>
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
