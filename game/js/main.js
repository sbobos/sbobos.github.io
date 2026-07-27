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
import { selectMove } from "./ui/hunt.js";
import {
  selectWeaponPart,
  craftCustomWeapon,
  equipCustomWeapon,
} from "./ui/village/weaponforge.js";
import { setWeaponSubTab, upgradeForge } from "./ui/village/forge.js";

window.startHunt = startHunt;
window.selectMove = selectMove;
window.startExpedition = startExpedition;
window.continueExpedition = continueExpedition;
window.upgradeForge = upgradeForge;
window.selectWeaponPart = selectWeaponPart;
window.craftCustomWeapon = craftCustomWeapon;
window.equipCustomWeapon = equipCustomWeapon;
window.setWeaponSubTab = setWeaponSubTab;
window.playerAction = playerAction;
window.craftItem = craftItem;
window.buyShopItem = buyShopItem;
window.turnInBounty = turnInBounty;
window.doTrade = doTrade;
window.equipOwnedItem = equipOwnedItem;
window.renderVillage = renderVillage;
window.setVillageTab = setVillageTab;
window.doGenerateSave = doGenerateSave;
window.doLoadSave = doLoadSave;
window.doNewGame = doNewGame;

renderVillage();
