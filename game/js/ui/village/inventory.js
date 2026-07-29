import { player } from "../../state.js";
import {
  WEAPONS,
  ARMORS,
  assembleWeapon,
  assembleFromPartKeys,
} from "../../data/gear.js";
import { renderPaperdoll } from "../shared/equipmentloadout.js";
import { renderVillage } from "../village.js";

/* ---------- LOCAL UI STATE (ephemeral — not saved) ---------- */
let activeInvTab = "weapons";
let selectedKeys = {
  weapons: null,
  armor: null,
  materials: null,
  trophies: null,
};

const INV_TABS = [
  { key: "weapons", label: "Weapons" },
  { key: "armor", label: "Armor" },
  { key: "materials", label: "Materials" },
  { key: "trophies", label: "Trophies" },
];

/* ---------- ICON HELPERS (no icon data on items yet — type-based fallback) ---------- */
function weaponIcon(damageType) {
  const map = { slash: "🗡️", blunt: "🔨", pierce: "🔱", fire: "🔥", ice: "❄️" };
  return map[(damageType || "").toLowerCase()] || "⚔️";
}
function armorIcon(slot) {
  const map = { head: "🪖", chest: "🥋", arms: "🧤", waist: "🎗️", legs: "👢" };
  return map[slot] || "🛡️";
}

/* ---------- DATA ASSEMBLY ---------- */
function getWeaponList() {
  const owned = player.ownedWeapons.map((key) => {
    const item = assembleWeapon(key);
    return {
      key,
      name: item.name,
      atk: item.atk,
      damageType: item.damageType,
      element: item.element,
      elementPower: item.elementPower,
      equipped: player.weapon === key,
      custom: false,
    };
  });

  const custom = Object.values(player.customWeapons || {})
    .map((w) => {
      const item = assembleFromPartKeys(w);
      if (!item) return null;
      return {
        key: w.id,
        name: w.name,
        atk: item.atk,
        damageType: item.damageType,
        element: item.element,
        elementPower: item.elementPower,
        equipped: player.weapon === w.id,
        custom: true,
      };
    })
    .filter(Boolean);

  return [...owned, ...custom];
}

function getArmorList() {
  return player.ownedArmors.map((key) => {
    const item = ARMORS[key];
    return {
      key,
      name: item.name,
      slot: item.slot,
      def: item.def,
      resist: item.resist,
      equipped: player.armorSlots[item.slot] === key,
    };
  });
}

/* ---------- ICON STRIP ---------- */
function renderIconStrip(items, tab, selectedKey, iconFn) {
  return `
    <div class="detail-strip inv-icon-strip">
      ${items
        .map(
          (it) => `
        <div class="inv-icon-item ${it.key === selectedKey ? "selected" : ""} ${it.equipped ? "equipped" : ""}"
             onclick="selectInventoryItem('${tab}', '${it.key}')">
          <span class="inv-icon">${iconFn(it)}</span>
          <span class="inv-icon-label">${it.name}</span>
          ${it.equipped ? '<span class="inv-icon-badge">E</span>' : ""}
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

/* ---------- DETAIL PANELS ---------- */
function renderWeaponDetail(item) {
  if (!item) return `<div class="inv-empty">Select a weapon.</div>`;
  const equipAction = item.custom
    ? `equipCustomWeapon('${item.key}')`
    : `equipOwnedItem('${item.key}', true)`;

  return `
    <div class="inv-detail-header">
      <span class="inv-detail-icon">${weaponIcon(item.damageType)}</span>
      <div>
        <div class="inv-detail-title">${item.name}</div>
        <div class="inv-detail-tag">${item.damageType}</div>
      </div>
    </div>
    <div class="gear-stats">
      <span class="stat-badge atk"><b>ATK</b> ${item.atk}</span>
      ${item.element !== "none" ? `<span class="stat-badge elem"><b>${item.element.toUpperCase()}</b> +${item.elementPower}</span>` : ""}
    </div>
    <div class="shop-actions">
      <span class="status-text">${item.equipped ? "Equipped" : "In Storage"}</span>
      <button ${item.equipped ? "disabled" : ""} onclick="${equipAction}">
        ${item.equipped ? "Ready" : "Equip"}
      </button>
    </div>
  `;
}

function renderArmorDetail(item) {
  if (!item) return `<div class="inv-empty">Select a piece of armor.</div>`;
  const resists =
    item.resist && (item.resist.fire || item.resist.ice)
      ? Object.entries(item.resist)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => `${k} +${v}%`)
          .join(" · ")
      : null;

  return `
    <div class="inv-detail-header">
      <span class="inv-detail-icon">${armorIcon(item.slot)}</span>
      <div>
        <div class="inv-detail-title">${item.name}</div>
        <div class="inv-detail-tag slot">${item.slot}</div>
      </div>
    </div>
    <div class="gear-stats">
      <span class="stat-badge def"><b>DEF</b> ${item.def}</span>
      ${resists ? `<span class="stat-badge resist">${resists}</span>` : ""}
    </div>
    <div class="shop-actions">
      <span class="status-text">${item.equipped ? "Equipped" : "In Storage"}</span>
      <button ${item.equipped ? "disabled" : ""} onclick="equipOwnedItem('${item.key}', false)">
        ${item.equipped ? "Ready" : "Equip"}
      </button>
    </div>
  `;
}

function renderMaterialDetail(entry) {
  if (!entry) return `<div class="inv-empty">Select a material.</div>`;
  const [name, count] = entry;
  return `
    <div class="inv-detail-header">
      <span class="inv-detail-icon">📦</span>
      <div>
        <div class="inv-detail-title">${name}</div>
        <div class="inv-detail-tag">Material</div>
      </div>
    </div>
    <div class="gear-stats">
      <span class="stat-badge"><b>Owned</b> ${count}</span>
    </div>
  `;
}

function renderTrophyDetail(entry) {
  if (!entry) return `<div class="inv-empty">Select a trophy.</div>`;
  const [name, count] = entry;
  return `
    <div class="inv-detail-header">
      <span class="inv-detail-icon">🏆</span>
      <div>
        <div class="inv-detail-title">${name}</div>
        <div class="inv-detail-tag">Trophy</div>
      </div>
    </div>
    <div class="gear-stats">
      <span class="stat-badge"><b>Owned</b> ${count}</span>
    </div>
  `;
}

/* ---------- TAB CONTENT ---------- */
function renderTabContent() {
  if (activeInvTab === "weapons") {
    const items = getWeaponList();
    if (!items.length)
      return `<div class="inv-empty">No weapons unlocked yet.</div>`;
    if (!items.find((i) => i.key === selectedKeys.weapons))
      selectedKeys.weapons = items[0].key;
    const selected = items.find((i) => i.key === selectedKeys.weapons);
    return `
      <div class="detail-layout">
        ${renderIconStrip(items, "weapons", selectedKeys.weapons, (it) => weaponIcon(it.damageType))}
        <div class="detail-sidebar">${renderWeaponDetail(selected)}</div>
      </div>
    `;
  }

  if (activeInvTab === "armor") {
    const items = getArmorList();
    if (!items.length)
      return `<div class="inv-empty">No armor unlocked yet.</div>`;
    if (!items.find((i) => i.key === selectedKeys.armor))
      selectedKeys.armor = items[0].key;
    const selected = items.find((i) => i.key === selectedKeys.armor);
    return `
      <div class="detail-layout">
        ${renderIconStrip(items, "armor", selectedKeys.armor, (it) => armorIcon(it.slot))}
        <div class="detail-sidebar">${renderArmorDetail(selected)}</div>
      </div>
    `;
  }

  if (activeInvTab === "materials") {
    const entries = Object.entries(player.materials).filter(([, n]) => n > 0);
    if (!entries.length)
      return `<div class="inv-empty">No materials yet — every hunt adds more.</div>`;
    if (!entries.find(([name]) => name === selectedKeys.materials))
      selectedKeys.materials = entries[0][0];
    const selected = entries.find(([name]) => name === selectedKeys.materials);
    const items = entries.map(([name, count]) => ({
      key: name,
      name,
      equipped: false,
      count,
    }));
    return `
      <div class="detail-layout">
        ${renderIconStrip(items, "materials", selectedKeys.materials, () => "📦")}
        <div class="detail-sidebar">${renderMaterialDetail(selected)}</div>
      </div>
    `;
  }

  if (activeInvTab === "trophies") {
    const entries = Object.entries(player.trophies);
    if (!entries.length)
      return `<div class="inv-empty">No trophies collected yet.</div>`;
    if (!entries.find(([name]) => name === selectedKeys.trophies))
      selectedKeys.trophies = entries[0][0];
    const selected = entries.find(([name]) => name === selectedKeys.trophies);
    const items = entries.map(([name, count]) => ({
      key: name,
      name,
      equipped: false,
      count,
    }));
    return `
      <div class="detail-layout">
        ${renderIconStrip(items, "trophies", selectedKeys.trophies, () => "🏆")}
        <div class="detail-sidebar">${renderTrophyDetail(selected)}</div>
      </div>
    `;
  }

  return "";
}

/* ---------- TAB BAR ---------- */
function renderTabBar() {
  return `
    <div class="inv-tab-bar">
      ${INV_TABS.map(
        (t) => `
        <button class="inv-tab ${activeInvTab === t.key ? "active" : ""}" onclick="selectInventoryTab('${t.key}')">
          ${t.label}
        </button>
      `,
      ).join("")}
    </div>
  `;
}

/* ---------- TAB ENTRY POINT ---------- */
export function renderInventoryTab() {
  return `
    <div class="panel">
      <h2>Inventory</h2>
      <p class="section-copy">Track your gear, resources, and the trophies that mark your path across the wilds.</p>

      <div class="inventory-summary-grid">
        <div class="card summary-card compact">
          <div class="summary-label">Vitals & Supplies</div>
          <div class="vital-row">
            <span class="vital-badge hp">HP <b>${player.hp}/${player.maxHp}</b></span>
            <span class="vital-badge stamina">STAM <b>${player.stamina}/${player.maxStamina}</b></span>
            <span class="vital-badge potion">🧪 Potions <b>${player.potions}</b></span>
          </div>
        </div>

        <div class="card summary-card wide-card">
          <div class="summary-label">Equipment Loadout</div>
          ${renderPaperdoll()}
        </div>
      </div>
    </div>

    <div class="panel">
      ${renderTabBar()}
      ${renderTabContent()}
    </div>
  `;
}

/* ---------- UI HANDLERS (need window bindings in main.js) ---------- */
export function selectInventoryTab(tab) {
  activeInvTab = tab;
  renderVillage();
}

export function selectInventoryItem(tab, key) {
  selectedKeys[tab] = key;
  renderVillage();
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
