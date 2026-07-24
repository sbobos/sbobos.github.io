import {
  renderVillage,
  setVillageTab,
  equipOwnedItem,
  craftItem,
  doGenerateSave,
  doLoadSave,
  doNewGame,
} from "./ui/village.js";

import {
  buyShopItem,
  turnInBounty,
  doTrade,
} from "./ui/camp.js";

import { startHunt } from "./hunt/setup.js";
import { startExpedition, continueExpedition } from "./hunt/expedition.js";
import { playerAction } from "./hunt/actions.js";

window.startHunt = startHunt;
window.startExpedition = startExpedition;
window.continueExpedition = continueExpedition;
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