import { renderVillage, setVillageTab, equipOwnedItem, craftItem,
         doGenerateSave, doLoadSave, doNewGame } from './ui/village.js';
import { buyShopItem, turnInBounty, doTrade } from './ui/camp.js';
import { startHunt } from './hunt/setup.js';
import { playerAction } from './hunt/actions.js';

/* ---------- INIT ----------
   All onclick="" handlers in the rendered HTML strings call these by name,
   so they need to live on window — ES modules don't do that automatically.
*/
window.startHunt = startHunt;
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
