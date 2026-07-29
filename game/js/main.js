import {
  renderVillage,
  setVillageTab,
  equipOwnedItem,
  craftItem,
  doGenerateSave,
  doLoadSave,
  doNewGame,
} from "./ui/village.js";

import { buyShopItem, turnInBounty, doTrade } from "./ui/camp.js";

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
  setForgeSubTab,
  upgradeForge,
  selectWeaponPresetItem,
} from "./ui/village/forge.js";
import { selectArmorItem } from "./ui/village/armorforge.js";
import { selectQuestItem } from "./ui/village/questboard.js";
import {
  selectInventoryTab,
  selectInventoryItem,
} from "./ui/village/inventory.js";
import { selectCampTab, selectCampItem } from "./ui/camp.js";

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
window.setForgeSubTab = setForgeSubTab;
window.selectArmorItem = selectArmorItem;
window.selectWeaponPresetItem = selectWeaponPresetItem;
window.playerAction = playerAction;
window.craftItem = craftItem;
window.selectCampTab = selectCampTab;
window.selectCampItem = selectCampItem;
window.buyShopItem = buyShopItem;
window.turnInBounty = turnInBounty;
window.doTrade = doTrade;
window.equipOwnedItem = equipOwnedItem;
window.renderVillage = renderVillage;
window.setVillageTab = setVillageTab;
window.selectInventoryTab = selectInventoryTab;
window.selectInventoryItem = selectInventoryItem;
window.doGenerateSave = doGenerateSave;
window.doLoadSave = doLoadSave;
window.doNewGame = doNewGame;

renderVillage();
