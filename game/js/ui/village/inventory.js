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
      <div class="card inventory-card">
        <div class="shop-title">${item.name}</div>
        <div class="shop-desc">ATK ${item.atk} · ${item.damageType}${item.element !== "none" ? " · +" + item.elementPower + " " + item.element : ""}</div>
        <div class="shop-actions">
          <span>${equipped ? "Equipped" : "Owned"}</span>
          <button ${equipped ? "disabled" : ""} onclick="equipOwnedItem('${item.key}', true)">${equipped ? "Ready" : "Equip"}</button>
        </div>
      </div>
    `;
    })
    .join("");

  const armorCards = player.ownedArmors
    .map((key) => {
      const item = ARMORS[key];
      const equipped = player.armorSlots[item.slot] === key;
      return `
      <div class="card inventory-card">
        <div class="shop-title">${item.name}</div>
        <div class="shop-desc">DEF ${item.def}${
          item.resist.fire || item.resist.ice
            ? " · resist " +
              Object.entries(item.resist)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => k + " " + v + "%")
                .join(", ")
            : ""
        }</div>
        <div class="shop-actions">
          <span>${equipped ? "Equipped" : "Owned"}</span>
          <button ${equipped ? "disabled" : ""} onclick="equipOwnedItem('${item.key}', false)">${equipped ? "Ready" : "Equip"}</button>
        </div>
      </div>
    `;
    })
    .join("");

  const materialEntries = Object.entries(player.materials).filter(
    ([, n]) => n > 0,
  );
  const materialHtml = materialEntries.length
    ? `<div class="inv-grid">${materialEntries.map(([name, count]) => `<div class="inv-item"><span>${name}</span><span class="n">x${count}</span></div>`).join("")}</div>`
    : `<div class="inv-empty">No materials yet — every hunt adds more.</div>`;

  const trophyEntries = Object.entries(player.trophies);
  const trophyHtml = trophyEntries.length
    ? `<div class="inv-grid">${trophyEntries.map(([name, count]) => `<div class="inv-item"><span>${name}</span><span class="n">x${count}</span></div>`).join("")}</div>`
    : `<div class="inv-empty">No trophies collected yet.</div>`;

  return `
    <div class="panel">
      <h2>Inventory</h2>
      <p class="section-copy">Track your gear, resources, and the trophies that mark your path across the wilds.</p>
      <div class="inventory-grid">
        <div class="card inventory-card wide-card">
          <div class="shop-title">Supplies</div>
          <div class="shop-desc">Potions: ${player.potions} · HP: ${player.hp}/${player.maxHp} · Stamina: ${player.stamina}/${player.maxStamina}</div>
        </div>
        <div class="card inventory-card wide-card">
          <div class="shop-title">Equipment</div>
          <div class="shop-desc">Weapon: ${currentWeapon().name} · ${["head", "chest", "arms", "waist", "legs"].map((s) => `${s[0].toUpperCase() + s.slice(1)}: ${currentArmor()[s]?.name || "—"}`).join(" · ")}</div>
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
