import { player } from "../../state.js";
import { WEAPONS, ARMORS, assembleWeapon } from "../../data/gear.js";
import { SKILLS } from "../../data/skills.js";
import {
  currentWeapon,
  currentArmor,
  addMat,
  getArmorStats,
} from "../../utils.js";
import { renderVillage } from "../village.js";

export function renderForgeTab() {
  const weaponCards = Object.keys(WEAPONS)
    .map((key) => renderCraftCard(assembleWeapon(key), true))
    .join("");
  const armorCards = Object.values(ARMORS)
    .map((item) => renderCraftCard(item, false))
    .join("");

  const current = currentWeapon();
  const stats = getArmorStats();
  const slotLabels = {
    head: "Head",
    chest: "Chest",
    arms: "Arms",
    waist: "Waist",
    legs: "Legs",
  };
  const armorChips = Object.entries(currentArmor())
    .map(
      ([slot, item]) =>
        `<div class="stat-chip">${slotLabels[slot]}: ${item ? item.name : "—"}</div>`,
    )
    .join("");

  const skillsHtml = stats.skillProgress.length
    ? stats.skillProgress
        .map(
          (s) =>
            `<div class="tree-node ${s.active ? "active unlocked" : ""}">${s.name} ${s.points}/${s.threshold}${s.active ? " · Active" : ""}</div>`,
        )
        .join("")
    : `<div class="tree-copy">No skill points from current gear yet.</div>`;

  const treeSummary = `
  <div class="stat-row">
    <div class="stat-chip">Weapon: ${current.name}</div>
    ${armorChips}
    <div class="stat-chip">Style: ${current.specialDesc}</div>
  </div>
  <div class="tree-panel">
    <div class="tree-title">Armor Skills</div>
    <div class="tree-copy">Points come from all 5 equipped pieces combined. Reach a skill's threshold to activate it.</div>
    <div class="tree-list">${skillsHtml}</div>
  </div>
  <div class="tree-panel">
    <div class="tree-title">Weapon tree</div>
    <div class="tree-copy">The first branch is always available. Later paths open after you prove yourself with their predecessor.</div>
    <div class="tree-list">
      ${Object.values(WEAPONS)
        .filter(
          (item) =>
            item.tree === "starter" ||
            item.tree === "boar" ||
            item.tree === "wyrm" ||
            item.tree === "bear" ||
            item.tree === "master",
        )
        .map((item) => {
          const unlocked =
            item.key === "basic" ||
            player.ownedWeapons.includes(item.unlocksFrom || item.key) ||
            player.ownedWeapons.includes(item.key);
          const active = player.weapon === item.key;
          return `<div class="tree-node ${active ? "active" : ""} ${unlocked ? "unlocked" : ""}">${item.name}${active ? " · Equipped" : ""}</div>`;
        })
        .join("")}
    </div>
  </div>
`;
  return `
    <div class="panel">
      <h2>Forge</h2>
      <p class="section-copy">Craft reliable tools and armor from the materials you carve from each hunt. Your loadout is the real progression here.</p>
      ${treeSummary}
    </div>
    <div class="panel">
      <h2>Weapons</h2>
      <div class="forge-grid">${weaponCards}</div>
    </div>
    <div class="panel">
      <h2>Armor</h2>
      <div class="forge-grid">${armorCards}</div>
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
  const canUnlock = isWeapon
    ? !item.unlocksFrom ||
      player.ownedWeapons.includes(item.unlocksFrom) ||
      player.weapon === item.unlocksFrom
    : true;
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
        <li class="${goldcoinOk ? "ok" : "bad"}"><span>goldcoin</span><span>${player.goldcoin}/${item.goldcoin}</span></li>
      </ul>
    `;
  }

  let btnLabel = "Craft & equip";
  if (equipped) btnLabel = "Equipped";
  else if (owned) btnLabel = "Equip";
  const unlockHint =
    isWeapon && item.unlocksFrom && !canUnlock
      ? `<div class="tree-copy">Requires ${WEAPONS[item.unlocksFrom].name}</div>`
      : "";

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
      <button ${!owned && !allOk ? "disabled" : ""} ${equipped ? "disabled" : ""} ${isWeapon && item.unlocksFrom && !canUnlock ? "disabled" : ""} onclick="craftItem('${item.key}', ${isWeapon})">
        ${btnLabel}
      </button>
    </div>
  `;
}

export function craftItem(key, isWeapon) {
  const item = isWeapon ? WEAPONS[key] : ARMORS[key];
  if (!item) return;
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
