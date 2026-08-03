import { buildShopTabs } from "./camp.js";
import { buildQuestTabs } from "./questboard.js";
import { buildForgeTabs } from "./forge.js";
import { buildInventoryTabs } from "./inventory.js";
import { buildSaveTabs } from "./saveload.js";

export const BUILDINGS = {
    camp: {
    title: "Camp",
    scene: "camp",
    ox: "50%",
    oy: "50%",
    tabsFn: buildShopTabs,
  },

  quests: {
    title: "Quest Board",
    scene: "quests",
    ox: "50%",
    oy: "50%",
    tabsFn: buildQuestTabs,
  },

  forge: {
    title: "Forge",
    scene: "forge",
    ox: "50%",
    oy: "50%",
    tabsFn: buildForgeTabs,
  },

  inventory: {
    title: "Inventory",
    scene: "inventory",
    ox: "50%",
    oy: "50%",
    tabsFn: buildInventoryTabs,
  },

  save: {
    title: "Save / Load",
    scene: "save",
    ox: "50%",
    oy: "50%",
    tabsFn: buildSaveTabs,
  },
};
