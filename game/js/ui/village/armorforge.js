import { ARMORS } from "../../data/gear.js";
import { ARMOR_SLOTS, currentArmor } from "../../utils.js";
import { renderCraftCard } from "./forge.js";
import { renderVillage } from "../village.js";

const SLOT_LABELS = {
  head: "Head",
  chest: "Chest",
  arms: "Arms",
  waist: "Waist",
  legs: "Legs",
};

let selectedArmorKey = null; // module-level, mirrors the weapon-forge draft pattern

export function selectArmorItem(key) {
  selectedArmorKey = key;
  renderVillage();
}

function renderArmorIcon(item, selected, equipped) {
  const forgeLevelOk = true; // renderCraftCard already handles lock/afford logic in the detail panel
  return `
    <div class="gear-icon ${selected ? "selected" : ""} ${equipped ? "equipped" : ""}"
         onclick="selectArmorItem('${item.key}')" title="${item.name}">
      <div class="gear-icon-label">${item.name.slice(0, 3).toUpperCase()}</div>
    </div>
  `;
}

function renderArmorDetail() {
  const item = ARMORS[selectedArmorKey];
  if (!item) {
    return `<div class="tree-copy">Select a piece above to see its full stats.</div>`;
  }
  return `
    <div class="gear-sprite-placeholder">
      ${item.name} Sprite
      <span class="placeholder-note">Visual coming later</span>
    </div>
    ${renderCraftCard(item, false)}
  `;
}

export function renderArmorTab() {
  const equipped = currentArmor();

  const slotRows = ARMOR_SLOTS.map((slot) => {
    const items = Object.values(ARMORS).filter((a) => a.slot === slot);
    const equippedKey = equipped[slot]?.key;
    const icons = items
      .map((item) =>
        renderArmorIcon(
          item,
          item.key === selectedArmorKey,
          item.key === equippedKey,
        ),
      )
      .join("");
    const equippedName = equipped[slot] ? equipped[slot].name : "Empty";

    return `
      <div class="armor-slot-row">
        <div class="slot-row-label">${SLOT_LABELS[slot]} · ${equippedName}</div>
        <div class="icon-strip">${icons}</div>
      </div>
    `;
  }).join("");

  return `
    <div class="armor-tab-layout">
      <div class="armor-slot-list">${slotRows}</div>
      <div class="armor-detail-panel">${renderArmorDetail()}</div>
    </div>
  `;
}
