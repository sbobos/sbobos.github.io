import { Camera } from "./engine/camera.js";
import { Overlay } from "./engine/overlay.js";
import { Wipe } from "./engine/wipe.js";

import { BUILDINGS } from "./ui/village/building.js";

import {
  renderVillage,
  equipOwnedItem,
  craftItem,
  doGenerateSave,
  doLoadSave,
  doNewGame,
} from "./ui/village.js";

import { buyShopItem, turnInBounty, doTrade } from "./ui/village/camp.js";

import { startHunt } from "./hunt/setup.js";
import { startExpedition, continueExpedition } from "./hunt/expedition.js";
import { playerAction } from "./hunt/actions.js";
import { selectPart } from "./ui/hunt.js";
import {
  selectWeaponPart,
  craftCustomWeapon,
  equipCustomWeapon,
} from "./ui/village/weaponforge.js";
import {
  setWeaponSubTab,
  upgradeForge,
  selectWeaponPresetItem,
} from "./ui/village/forge.js";
import { selectArmorItem } from "./ui/village/armorforge.js";
import { selectQuestItem } from "./ui/village/questboard.js";

const camera = new Camera(document.getElementById("world"));

const wipe = new Wipe(document.getElementById("wipe"));

const overlay = new Overlay({
  shellEl: document.querySelector(".panel-shell"),
  titleEl: document.querySelector(".panel-header h2"),
  tabbarEl: document.querySelector(".panel-tabbar"),
  bodyEl: document.querySelector(".panel-body"),
  closeBtn: document.querySelector(".panel-close"),
});

overlay.onClose = () => {
  renderVillage();
};

window.selectQuestItem = selectQuestItem;
window.startHunt = startHunt;
window.selectPart = selectPart;
window.startExpedition = startExpedition;
window.continueExpedition = continueExpedition;
window.upgradeForge = upgradeForge;
window.selectWeaponPart = selectWeaponPart;
window.craftCustomWeapon = craftCustomWeapon;
window.equipCustomWeapon = equipCustomWeapon;
window.setWeaponSubTab = setWeaponSubTab;
window.selectArmorItem = selectArmorItem;
window.selectWeaponPresetItem = selectWeaponPresetItem;
window.playerAction = playerAction;
window.craftItem = craftItem;
window.buyShopItem = buyShopItem;
window.turnInBounty = turnInBounty;
window.doTrade = doTrade;
window.equipOwnedItem = equipOwnedItem;
window.renderVillage = renderVillage;
window.doLoadSave = doLoadSave;
window.doNewGame = doNewGame;

renderVillage();

document.addEventListener("click", async (e) => {
  const button = e.target.closest("[data-building]");

  if (!button) return;

  const building = BUILDINGS[button.dataset.building];

  if (!building) return;

  await camera.panInto(building.ox, building.oy);

  wipe.to(() => {
    camera.resetSilently();

    overlay.show({
      title: building.title,
      tabsFn: building.tabsFn,
    });
  });
});
