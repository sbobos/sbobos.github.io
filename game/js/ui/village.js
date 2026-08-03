import { renderTopbar } from "./topbar.js";
import { renderVillageScene } from "./village/scene.js";

/* ---------- VILLAGE SCREEN ---------- */

export function renderVillage() {
  document.getElementById("hunt-screen").classList.add("hidden");

  const village = document.getElementById("village-screen");

  village.classList.remove("hidden");
  village.innerHTML = renderVillageScene();

  renderTopbar();
}

/* ------------------------------------------------------------------
   Temporary compatibility.

   setVillageTab() is no longer responsible for changing the village
   UI. During the migration to Camera + Wipe + Overlay it exists only
   so older code doesn't immediately break.

   Remove this once every building has been converted.
------------------------------------------------------------------ */
export function setVillageTab(tab) {
  console.warn(
    `setVillageTab("${tab}") is deprecated. Building overlays now handle navigation.`,
  );
}

/* ---------- RE-EXPORTS ---------- */

export {
  getActiveStoryMission,
  refreshQuestBoard,
  getQuestBoardEntries,
  buildQuestTabs,
} from "./village/questboard.js";

export { renderCraftCard, craftItem } from "./village/forge.js";

export { buildInventoryTabs, equipOwnedItem } from "./village/inventory.js";

export {
  doGenerateSave,
  doLoadSave,
  doNewGame,
} from "./village/saveload.js";
