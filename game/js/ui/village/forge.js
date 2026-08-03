import { player } from "../../state.js";
import { WEAPONS, ARMORS, assembleWeapon } from "../../data/gear.js";
import { SKILLS } from "../../data/skills.js";
import { FORGE_LEVELS } from "../../data/forge.js";
import {
  currentWeapon,
  currentArmor,
  addMat,
  getArmorStats,
} from "../../utils.js";
import { renderVillage } from "../village.js";
import {
  renderCustomForgeTab,
  selectWeaponPart,
  equipCustomWeapon,
} from "./weaponforge.js";
import { renderArmorTab, selectArmorItem } from "./armorforge.js";

let selectedWeaponKey = null;
let weaponSubTab = "presets";

export function selectWeaponPresetItem(key) {
  selectedWeaponKey = key;
}

export function setWeaponSubTab(tab) {
  weaponSubTab = tab;
}

function renderWeaponIcon(item, selected, equipped) {
  return `
    <div
      class="gear-icon ${selected ? "selected" : ""} ${equipped ? "equipped" : ""}"
      data-action="select-weapon"
      data-key="${item.key}"
      title="${item.name}">
      <div class="gear-icon-label">${item.name.slice(0, 3).toUpperCase()}</div>
    </div>
  `;
}

function renderWeaponPresetDetail() {
  const item = selectedWeaponKey ? assembleWeapon(selectedWeaponKey) : null;
  if (!item) {
    return `<div class="tree-copy">Select a weapon above to see its full stats.</div>`;
  }
  return `
    <div class="gear-sprite-placeholder">
      ${item.name} Sprite
      <span class="placeholder-note">Visual coming later</span>
    </div>
    ${renderCraftCard(item, true)}
  `;
}

function renderWeaponPresetsView() {
  const icons = Object.keys(WEAPONS)
    .map((key) => {
      const item = assembleWeapon(key);
      return renderWeaponIcon(
        item,
        key === selectedWeaponKey,
        key === player.weapon,
      );
    })
    .join("");

  return `
    <div class="detail-layout">
      <div class="detail-strip armor-slot-list">
        <div class="armor-slot-row">
          <div class="slot-row-label">Preset Weapons</div>
          <div class="icon-strip">${icons}</div>
        </div>
      </div>
      <div class="detail-sidebar">${renderWeaponPresetDetail()}</div>
    </div>
  `;
}

export function buildForgeTabs() {
  return [
    {
      key: "upgrade",
      label: "Upgrade",

      render() {
        const stats = getArmorStats();
        const skillsHtml = stats.skillProgress.length
          ? stats.skillProgress
              .map(
                (s) =>
                  `<div class="tree-node ${s.active ? "active unlocked" : ""}">
                    ${s.name} ${s.points}/${s.threshold}${s.active ? " · Active" : ""}
                  </div>`,
              )
              .join("")
          : `<div class="tree-copy">No skill points from current gear yet.</div>`;

        const forgeInfo = FORGE_LEVELS[player.forgeLevel];

        return `
          <div class="stat-row">
            <div class="stat-chip">
              Forge: ${forgeInfo.name} (Lv ${forgeInfo.level})
            </div>
          </div>

          <div class="forge-layout">
            <div class="forge-main">
              ${renderForgeLevelPanel()}
              ${renderForgeSpritePlaceholder()}
            </div>

            <div class="forge-sidebar">
              <div class="tree-panel">
                <div class="tree-title">Armor Skills</div>
                <div class="tree-copy">
                  Points come from all equipped pieces combined.
                </div>
                <div class="tree-list">
                  ${skillsHtml}
                </div>
              </div>
            </div>
          </div>
        `;
      },

      onAction(body, action, key, event, overlay) {
        if (action === "upgrade-forge") {
          upgradeForge();
          overlay.refresh(); // INSTANTLY refreshes the tab state!
        }
      },
    },

    {
      key: "weapons",
      label: "Weapons",

      render() {
        return `
          <div class="subtab-row">
            <button
              class="subtab-btn ${weaponSubTab === "presets" ? "active" : ""}"
              data-action="weapon-subtab"
              data-key="presets">
              Presets
            </button>

            <button
              class="subtab-btn ${weaponSubTab === "custom" ? "active" : ""}"
              data-action="weapon-subtab"
              data-key="custom">
              Custom Forge
            </button>
          </div>

          ${
            weaponSubTab === "presets"
              ? renderWeaponPresetsView()
              : renderCustomForgeTab()
          }
        `;
      },

      onAction(body, action, key, event, overlay) {
        if (action === "weapon-subtab") {
          weaponSubTab = key;
          overlay.refresh();
          return;
        }

        if (action === "select-weapon") {
          selectedWeaponKey = key;
          overlay.refresh();
          return;
        }

        if (action === "select-part") {
          const slot = event.target.closest("[data-slot]")?.dataset.slot;
          if (slot && key) {
            selectWeaponPart(slot, key);
            overlay.refresh();
          }
          return;
        }

        if (action === "equip-custom") {
          equipCustomWeapon(key);
          overlay.refresh();
          return;
        }

        if (action === "craft-preset") {
          craftItem(key, true);
          overlay.refresh();
          return;
        }

        if (action === "craft-custom") {
          craftCustomWeapon();
          overlay.refresh();
          return;
        }
      },
    },

    {
      key: "armor",
      label: "Armor",

      render() {
        return renderArmorTab();
      },

      onAction(body, action, key, event, overlay) {
        if (action === "select-armor") {
          selectArmorItem(key);
          overlay.refresh();
          return;
        }

        if (action === "craft-armor") {
          craftItem(key, false);
          overlay.refresh();
          return;
        }
      },
    },
  ];
}

function renderForgeSpritePlaceholder() {
  const forgeInfo = FORGE_LEVELS[player.forgeLevel];
  return `
    <div class="forge-sprite-placeholder">
      Forge Sprite — ${forgeInfo.name} (Lv ${forgeInfo.level})
      <span class="placeholder-note">Visual coming later</span>
    </div>
  `;
}

function renderForgeLevelPanel() {
  const forgeInfo = FORGE_LEVELS[player.forgeLevel];
  const next = FORGE_LEVELS[player.forgeLevel + 1];

  if (!next) {
    return `
      <div class="tree-panel">
        <div class="tree-title">${forgeInfo.name} · Max Level</div>
        <div class="tree-copy">Your forge has reached its full potential — every tier is available if you have the materials.</div>
      </div>
    `;
  }

  const goldcoinOk = player.goldcoin >= next.goldcoin;
  const allOk =
    goldcoinOk &&
    Object.entries(next.recipe).every(
      ([mat, need]) => (player.materials[mat] || 0) >= need,
    );

  const reqRows = `
    <ul class="req-list">
      ${Object.entries(next.recipe)
        .map(([mat, need]) => {
          const have = player.materials[mat] || 0;
          const ok = have >= need;
          return `<li class="${ok ? "ok" : "bad"}"><span>${mat}</span><span>${have}/${need}</span></li>`;
        })
        .join("")}
      <li class="${goldcoinOk ? "ok" : "bad"}"><span>Gold Coin</span><span>${player.goldcoin}/${next.goldcoin}</span></li>
    </ul>
  `;

  return `
    <div class="tree-panel">
      <div class="tree-title">Next: ${next.name} (Level ${next.level})</div>
      <div class="tree-copy">${next.desc}</div>
      ${reqRows}
      <button ${allOk ? "" : "disabled"} data-action="upgrade-forge">Upgrade Forge</button>
    </div>
  `;
}

export function renderCraftCard(item, isWeapon) {
  const owned = isWeapon
    ? player.ownedWeapons.includes(item.key)
    : player.ownedArmors.includes(item.key);
  const equipped = isWeapon
    ? player.weapon === item.key
    : player.armorSlots[item.slot] === item.key;

  const chainOk = isWeapon
    ? !item.unlocksFrom ||
      player.ownedWeapons.includes(item.unlocksFrom) ||
      player.weapon === item.unlocksFrom
    : true;
  const forgeLevelOk = player.forgeLevel >= (item.forgeLevel ?? 0);
  const canUnlock = chainOk && forgeLevelOk;

  const currentItem = isWeapon ? currentWeapon() : currentArmor()[item.slot];
  const compareText = isWeapon
    ? `vs current: ${item.atk - currentItem.atk >= 0 ? "+" : ""}${item.atk - currentItem.atk} ATK`
    : currentItem
      ? `vs current: ${item.def - currentItem.def >= 0 ? "+" : ""}${item.def - currentItem.def} DEF`
      : "No piece equipped in this slot yet";

  let reqRows = "";
  let allOk = true;
  if (!owned && item.recipe) {
    const goldcoinOk = player.goldcoin >= item.goldcoin;
    allOk =
      goldcoinOk &&
      Object.entries(item.recipe).every(
        ([mat, need]) => (player.materials[mat] || 0) >= need,
      );
    reqRows = `
      <ul class="req-list">
        ${Object.entries(item.recipe)
          .map(([mat, need]) => {
            const have = player.materials[mat] || 0;
            const ok = have >= need;
            return `<li class="${ok ? "ok" : "bad"}"><span>${mat}</span><span>${have}/${need}</span></li>`;
          })
          .join("")}
        <li class="${goldcoinOk ? "ok" : "bad"}"><span>Gold Coin</span><span>${player.goldcoin}/${item.goldcoin}</span></li>
      </ul>
    `;
  }

  let btnLabel = "Craft & equip";
  if (equipped) btnLabel = "Equipped";
  else if (owned) btnLabel = "Equip";

  let unlockHint = "";
  if (isWeapon && item.unlocksFrom && !chainOk) {
    unlockHint = `<div class="tree-copy">Requires ${WEAPONS[item.unlocksFrom].name}</div>`;
  } else if (!forgeLevelOk) {
    const need = FORGE_LEVELS[item.forgeLevel];
    unlockHint = `<div class="tree-copy">Requires ${need.name} (Forge Level ${item.forgeLevel})</div>`;
  }

  const actionName = isWeapon ? "craft-preset" : "craft-armor";

  return `
    <div class="card craft-card">
      <div class="ctag">${item.tag}${owned && !equipped ? " · Owned" : ""}</div>
      <div class="cname">${item.name}</div>
      <div class="cstat">
        ${
          isWeapon
            ? "ATK " +
              item.atk +
              (item.element !== "none"
                ? " · +" + item.elementPower + " " + item.element
                : "")
            : "DEF " +
              item.def +
              (item.resist && (item.resist.fire || item.resist.ice)
                ? " · Resist " +
                  Object.entries(item.resist)
                    .filter(([, v]) => v > 0)
                    .map(([k, v]) => k + " " + v + "%")
                    .join(", ")
                : "") +
              (item.skills && Object.keys(item.skills).length
                ? " · " +
                  Object.entries(item.skills)
                    .map(([k, v]) => `${SKILLS[k]?.name || k} +${v}`)
                    .join(", ")
                : "")
        }
        ${!owned && item.recipe ? " · " + item.goldcoin + "z" : ""}
      </div>
      <div class="compare-text">${equipped ? "Current setup" : compareText}</div>
      ${isWeapon ? `<div class="weapon-style">${item.specialDesc}</div>` : ""}
      ${reqRows}
      ${unlockHint}
      <button ${!owned && !allOk ? "disabled" : ""} ${equipped ? "disabled" : ""} ${!canUnlock ? "disabled" : ""} data-action="${actionName}" data-key="${item.key}">
        ${btnLabel}
      </button>
    </div>
  `;
}

export function craftItem(key, isWeapon) {
  const item = isWeapon ? WEAPONS[key] : ARMORS[key];
  if (!item) return;
  if (player.forgeLevel < (item.forgeLevel ?? 0)) return;
  if (
    isWeapon &&
    item.unlocksFrom &&
    !player.ownedWeapons.includes(item.unlocksFrom)
  )
    return;
  const ownedList = isWeapon ? player.ownedWeapons : player.ownedArmors;

  if (!ownedList.includes(key)) {
    if (!item.recipe) return;
    const canAfford =
      player.goldcoin >= item.goldcoin &&
      Object.entries(item.recipe).every(
        ([mat, need]) => (player.materials[mat] || 0) >= need,
      );
    if (!canAfford) return;
    player.goldcoin -= item.goldcoin;
    Object.entries(item.recipe).forEach(([mat, need]) => addMat(mat, -need));
    ownedList.push(key);
  }
  if (isWeapon) player.weapon = key;
  else {
    const slot = item.slot || "chest";
    player.armorSlots[slot] = key;
  }
  renderVillage();
}

export function upgradeForge() {
  const nextLevel = player.forgeLevel + 1;
  const next = FORGE_LEVELS[nextLevel];
  if (!next) return;

  const canAfford =
    player.goldcoin >= next.goldcoin &&
    Object.entries(next.recipe).every(
      ([mat, need]) => (player.materials[mat] || 0) >= need,
    );
  if (!canAfford) return;

  player.goldcoin -= next.goldcoin;
  Object.entries(next.recipe).forEach(([mat, need]) => addMat(mat, -need));
  player.forgeLevel = nextLevel;

  renderVillage();
}