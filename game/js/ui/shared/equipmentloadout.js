import { currentArmor, currentWeapon } from "../../utils.js";

/* Shared paperdoll markup — single source of truth for equipment loadout
   visualization, used by both Inventory and Forge, so neither reimplements
   its own version of the same data. */
export function renderPaperdoll() {
  const armor = currentArmor();
  const weapon = currentWeapon();

  return `
    <div class="paperdoll-layout">
      <div class="paperdoll-avatar">
        <div class="avatar-silhouette">⚔️</div>
        <div class="avatar-title">HUNTER</div>
      </div>
      <div class="doll-slot slot-head">
        <span class="slot-label">Head</span>
        <span class="slot-item">${armor.head?.name || "Empty"}</span>
      </div>
      <div class="doll-slot slot-chest">
        <span class="slot-label">Chest</span>
        <span class="slot-item">${armor.chest?.name || "Empty"}</span>
      </div>
      <div class="doll-slot slot-arms">
        <span class="slot-label">Arms</span>
        <span class="slot-item">${armor.arms?.name || "Empty"}</span>
      </div>
      <div class="doll-slot slot-waist">
        <span class="slot-label">Waist</span>
        <span class="slot-item">${armor.waist?.name || "Empty"}</span>
      </div>
      <div class="doll-slot slot-legs">
        <span class="slot-label">Legs</span>
        <span class="slot-item">${armor.legs?.name || "Empty"}</span>
      </div>
      <div class="doll-slot slot-weapon">
        <span class="slot-label">Weapon</span>
        <span class="slot-item highlight">${weapon.name}</span>
      </div>
    </div>
  `;
}
