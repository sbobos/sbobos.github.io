import { renderTopbar } from "./topbar.js";
import { renderCampTab } from "./camp.js";
import { renderQuestsTab } from "./village/questboard.js";
import { renderForgeTab } from "./village/forge.js";
import { renderInventoryTab } from "./village/inventory.js";
import { renderSaveTab } from "./village/saveload.js";

/* ---------- VILLAGE SCREEN STATE ---------- */
let villageTab = "quests";

export function setVillageTab(tab) {
  villageTab = tab;
  renderVillage();
}

export function renderVillage() {
  document.getElementById("hunt-screen").classList.add("hidden");
  const v = document.getElementById("village-screen");
  v.classList.remove("hidden");

  const tabs = [
    ["quests", "Quest Board"],
    ["forge", "Forge"],
    ["camp", "Camp"],
    ["inventory", "Inventory"],
    ["save", "Save / Load"],
  ];
  const tabBar = `
    <div class="actions" style="grid-template-columns:repeat(5,1fr); margin-bottom:18px;">
      ${tabs.map(([key, label]) => `<button class="${villageTab === key ? "primary" : ""}" onclick="setVillageTab('${key}')">${label}</button>`).join("")}
    </div>
  `;

  let body = "";
  if (villageTab === "quests") body = renderQuestsTab();
  else if (villageTab === "forge") body = renderForgeTab();
  else if (villageTab === "camp") body = renderCampTab();
  else if (villageTab === "inventory") body = renderInventoryTab();
  else if (villageTab === "save") body = renderSaveTab();

  v.innerHTML = tabBar + body;
  renderTopbar();
}

/* ---------- RE-EXPORTS ----------
   village.js used to be the single home for all of this. Re-exporting
   here means anything elsewhere in the codebase importing from
   "./village.js" (e.g. main.js's window.* bindings for inline onclick
   handlers) keeps working unchanged — only the internal file layout
   changed. If nothing outside this folder imports from these paths
   directly, these re-exports can eventually be trimmed in favor of
   importing straight from the submodules.
*/
export {
  getActiveStoryMission,
  refreshQuestBoard,
  getQuestBoardEntries,
  renderQuestsTab,
} from "./village/questboard.js";

export { renderForgeTab, renderCraftCard, craftItem } from "./village/forge.js";

export { renderInventoryTab, equipOwnedItem } from "./village/inventory.js";

export {
  renderSaveTab,
  doGenerateSave,
  doLoadSave,
  doNewGame,
} from "./village/saveload.js";

