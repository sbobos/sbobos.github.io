import { player } from "../../state.js";
import { WEAPONS, ARMORS, assembleWeapon } from "../../data/gear.js";
import { currentWeapon, currentArmor } from "../../utils.js";
import { renderVillage } from "../village.js";

export function renderInventoryTab() {
  const weaponCards = player.ownedWeapons
    .map((key) => {
      const item = assembleWeapon(key);
      const equipped = player.weapon === key;
      return `
      <div class="card inventory-card gear-card ${equipped ? "equipped" : ""}">
        <div class="gear-header">
          <span class="gear-title">${item.name}</span>
          <span class="gear-tag">${item.damageType}</span>
        </div>
        <div class="gear-stats">
          <span class="stat-badge atk"><b>ATK</b> ${item.atk}</span>
          ${item.element !== "none" ? `<span class="stat-badge elem"><b>${item.element.toUpperCase()}</b> +${item.elementPower}</span>` : ""}
        </div>
        <div class="shop-actions">
          <span class="status-text">${equipped ? "Equipped" : "In Storage"}</span>
          <button ${equipped ? "disabled" : ""} onclick="equipOwnedItem('${item.key}', true)">
            ${equipped ? "Ready" : "Equip"}
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  const armorCards = player.ownedArmors
    .map((key) => {
      const item = ARMORS[key];
      const equipped = player.armorSlots[item.slot] === key;
      const resists =
        item.resist.fire || item.resist.ice
          ? Object.entries(item.resist)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => `${k} +${v}%`)
              .join(" · ")
          : null;

      return `
      <div class="card inventory-card gear-card ${equipped ? "equipped" : ""}">
        <div class="gear-header">
          <span class="gear-title">${item.name}</span>
          <span class="gear-tag slot">${item.slot}</span>
        </div>
        <div class="gear-stats">
          <span class="stat-badge def"><b>DEF</b> ${item.def}</span>
          ${resists ? `<span class="stat-badge resist">${resists}</span>` : ""}
        </div>
        <div class="shop-actions">
          <span class="status-text">${equipped ? "Equipped" : "In Storage"}</span>
          <button ${equipped ? "disabled" : ""} onclick="equipOwnedItem('${item.key}', false)">
            ${equipped ? "Ready" : "Equip"}
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  const materialEntries = Object.entries(player.materials).filter(
    ([, n]) => n > 0,
  );
  const materialHtml = materialEntries.length
    ? `<div class="inv-grid">${materialEntries.map(([name, count]) => `<div class="inv-item"><span class="item-name">${name}</span><span class="n">x${count}</span></div>`).join("")}</div>`
    : `<div class="inv-empty">No materials yet — every hunt adds more.</div>`;

  const trophyEntries = Object.entries(player.trophies);
  const trophyHtml = trophyEntries.length
    ? `<div class="inv-grid">${trophyEntries.map(([name, count]) => `<div class="inv-item trophy"><span class="item-name">🏆 ${name}</span><span class="n">x${count}</span></div>`).join("")}</div>`
    : `<div class="inv-empty">No trophies collected yet.</div>`;

  return `
    <div class="panel">
      <h2>Inventory</h2>
      <p class="section-copy">Track your gear, resources, and the trophies that mark your path across the wilds.</p>
      
      <!-- Character HUD Overview -->
      <div class="inventory-summary-grid">
        <div class="card summary-card">
          <div class="summary-label">Vitals & Supplies</div>
          <div class="vital-row">
            <span class="vital-badge hp">HP <b>${player.hp}/${player.maxHp}</b></span>
            <span class="vital-badge stamina">STAM <b>${player.stamina}/${player.maxStamina}</b></span>
            <span class="vital-badge potion">🧪 Potions <b>${player.potions}</b></span>
          </div>
        </div>
        
        <div class="card summary-card wide-card">
          <div class="summary-label">Equipment Loadout</div>
          
          <div class="paperdoll-layout">
            <!-- Center Character Avatar / Silhouette -->
            <div class="paperdoll-avatar">
              <div class="avatar-silhouette">⚔️</div>
              <div class="avatar-title">HUNTER</div>
            </div>

            <!-- Equipment Slots placed spatially -->
            <div class="doll-slot slot-head">
              <span class="slot-label">Head</span>
              <span class="slot-item">${currentArmor().head?.name || "Empty"}</span>
            </div>

            <div class="doll-slot slot-chest">
              <span class="slot-label">Chest</span>
              <span class="slot-item">${currentArmor().chest?.name || "Empty"}</span>
            </div>

            <div class="doll-slot slot-arms">
              <span class="slot-label">Arms</span>
              <span class="slot-item">${currentArmor().arms?.name || "Empty"}</span>
            </div>

            <div class="doll-slot slot-waist">
              <span class="slot-label">Waist</span>
              <span class="slot-item">${currentArmor().waist?.name || "Empty"}</span>
            </div>

            <div class="doll-slot slot-legs">
              <span class="slot-label">Legs</span>
              <span class="slot-item">${currentArmor().legs?.name || "Empty"}</span>
            </div>

            <div class="doll-slot slot-weapon">
              <span class="slot-label">Weapon</span>
              <span class="slot-item highlight">${currentWeapon().name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <h2>Owned Weapons</h2>
      <div class="shop-grid">${weaponCards || '<div class="inv-empty">No weapons unlocked yet.</div>'}</div>
    </div>

    <div class="panel">
      <h2>Owned Armor</h2>
      <div class="shop-grid">${armorCards || '<div class="inv-empty">No armor unlocked yet.</div>'}</div>
    </div>

    <div class="panel">
      <h2>Materials</h2>
      ${materialHtml}
    </div>

    <div class="panel">
      <h2>Trophies</h2>
      ${trophyHtml}
    </div>
  `;
}

export function equipOwnedItem(key, isWeapon) {
  if (isWeapon) {
    if (player.ownedWeapons.includes(key)) player.weapon = key;
  } else if (player.ownedArmors.includes(key)) {
    const item = ARMORS[key];
    if (item) player.armorSlots[item.slot] = key;
  }
  renderVillage();
}
