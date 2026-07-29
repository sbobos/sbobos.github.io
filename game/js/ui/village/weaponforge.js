import { player } from "../../state.js";
import { HEADS, HANDLES, CORES, MECHANISMS } from "../../data/weaponparts.js";
import { assembleFromPartKeys, generateWeaponName } from "../../data/gear.js";
import { addMat } from "../../utils.js";
import { renderVillage } from "../village.js";

/* Draft is the picker's in-progress selection — resets to starter parts
   each session (module-level, not persisted). It's UI-only state; nothing
   is spent until craftCustomWeapon() succeeds. */
let draft = {
  headKey: "hunterEdge",
  handleKey: "basicGrip",
  coreKey: "inertCore",
  mechanismKey: "balancedSwing",
};

export function selectWeaponPart(slotType, key) {
  draft[slotType] = key;
  renderVillage();
}

export function equipCustomWeapon(id) {
  if (!player.customWeapons?.[id]) return;
  player.weapon = id;
  renderVillage();
}

function partForgeOk(part) {
  return player.forgeLevel >= (part.forgeLevel ?? 0);
}

function sumCost(parts) {
  let goldcoin = 0;
  const materials = {};
  parts.forEach((p) => {
    goldcoin += p.goldcoin || 0;
    Object.entries(p.recipe || {}).forEach(([mat, need]) => {
      materials[mat] = (materials[mat] || 0) + need;
    });
  });
  return { goldcoin, materials };
}

function renderPartOption(slotType, key, part, selected) {
  const locked = !partForgeOk(part);

  return `
     <div class="gear-icon ${selected ? "selected" : ""} ${locked ? "locked" : ""}"
          ${locked ? "" : `onclick="selectWeaponPart('${slotType}','${key}')"`}
          title="${part.name || "—"}${locked ? ` (Forge Lv ${part.forgeLevel} required)` : ""}">
       <div class="gear-icon-label">${(part.name || "—").slice(0, 3).toUpperCase()}</div>
     </div>
  `;
}

function renderSlot(slotType, catalog, label) {
  const options = Object.entries(catalog)
    .map(([key, part]) =>
      renderPartOption(slotType, key, part, draft[slotType] === key),
    )
    .join("");
  return `
    <div class="armor-slot">
      <div class="slot-row-label">${label}</div>
      <div class="icon-strip">${options}</div>
    </div>
  `;
}

function renderOwnedCustomList() {
  const entries = Object.values(player.customWeapons || {});
  if (!entries.length) return "";
  const icons = entries
    .map((w) => {
      const equipped = player.weapon === w.id;
      return `
        <div class="gear-icon ${equipped ? "equipped" : ""}"
             onclick="equipCustomWeapon('${w.id}')"
             title="${w.name}${equipped ? " (Equipped)" : ""}">
          <div class="gear-icon-label">${w.name.slice(0, 3).toUpperCase()}</div>
        </div>
      `;
    })
    .join("");
  return `
    <div class="armor-slot-row">
      <div class="slot-row-label">Your Custom Weapons</div>
      <div class="icon-strip">${icons}</div>
    </div>
  `;
}

export function renderCustomForgeTab() {
  const head = HEADS[draft.headKey];
  const handle = HANDLES[draft.handleKey];
  const core = CORES[draft.coreKey];
  const mech = MECHANISMS[draft.mechanismKey];

  const preview = assembleFromPartKeys(draft);
  const name = generateWeaponName(
    draft.headKey,
    draft.coreKey,
    draft.mechanismKey,
  );
  const requiredForgeLevel = Math.max(
    head.forgeLevel ?? 0,
    handle.forgeLevel ?? 0,
    core.forgeLevel ?? 0,
    mech.forgeLevel ?? 0,
  );
  const { goldcoin, materials } = sumCost([head, handle, core, mech]);

  const forgeLevelOk = player.forgeLevel >= requiredForgeLevel;
  const goldcoinOk = player.goldcoin >= goldcoin;
  const matsOk = Object.entries(materials).every(
    ([mat, need]) => (player.materials[mat] || 0) >= need,
  );
  const canCraft = forgeLevelOk && goldcoinOk && matsOk;

  const reqRows = `
    <ul class="req-list">
      ${Object.entries(materials)
        .map(([mat, need]) => {
          const have = player.materials[mat] || 0;
          return `<li class="${have >= need ? "ok" : "bad"}"><span>${mat}</span><span>${have}/${need}</span></li>`;
        })
        .join("")}
      <li class="${goldcoinOk ? "ok" : "bad"}"><span>Gold Coin</span><span>${player.goldcoin}/${goldcoin}</span></li>
      ${!forgeLevelOk ? `<li class="bad"><span>forge level</span><span>${player.forgeLevel}/${requiredForgeLevel}</span></li>` : ""}
    </ul>
  `;

  return `
    <p class="section-copy">Mix one part per category. A custom weapon is fixed once forged — no swapping parts afterward, so choose deliberately.</p>
    <div class="detail-layout">
      <div class="detail-strip armor-slot-list">
        ${renderSlot("headKey", HEADS, "Head")}
        ${renderSlot("handleKey", HANDLES, "Handle")}
        ${renderSlot("coreKey", CORES, "Core")}
        ${renderSlot("mechanismKey", MECHANISMS, "Mechanism")}
        ${renderOwnedCustomList()}
      </div>
      <div class="detail-sidebar">
        <div class="gear-sprite-placeholder">
          ${name} Sprite
          <span class="placeholder-note">Visual coming later</span>
        </div>
        <div class="weapon-preview card">
          <div class="cname">${name}</div>
          <div class="cstat">ATK ${preview.atk} · ${preview.damageType}${preview.element !== "none" ? ` · +${preview.elementPower} ${preview.element}` : ""}</div>
          <div class="weapon-style">${preview.specialDesc}</div>
        </div>
        ${reqRows}
        <button ${canCraft ? "" : "disabled"} onclick="craftCustomWeapon()">Forge Weapon</button>
      </div>
    </div>
  `;
}

export function craftCustomWeapon() {
  const head = HEADS[draft.headKey];
  const handle = HANDLES[draft.handleKey];
  const core = CORES[draft.coreKey];
  const mech = MECHANISMS[draft.mechanismKey];

  const requiredForgeLevel = Math.max(
    head.forgeLevel ?? 0,
    handle.forgeLevel ?? 0,
    core.forgeLevel ?? 0,
    mech.forgeLevel ?? 0,
  );
  if (player.forgeLevel < requiredForgeLevel) return;

  const { goldcoin, materials } = sumCost([head, handle, core, mech]);
  const canAfford =
    player.goldcoin >= goldcoin &&
    Object.entries(materials).every(
      ([mat, need]) => (player.materials[mat] || 0) >= need,
    );
  if (!canAfford) return;

  player.goldcoin -= goldcoin;
  Object.entries(materials).forEach(([mat, need]) => addMat(mat, -need));

  const id = `custom_${Date.now()}`;
  player.customWeapons[id] = {
    id,
    headKey: draft.headKey,
    handleKey: draft.handleKey,
    coreKey: draft.coreKey,
    mechanismKey: draft.mechanismKey,
    name: generateWeaponName(draft.headKey, draft.coreKey, draft.mechanismKey),
    forgeLevel: requiredForgeLevel,
  };
  player.weapon = id;

  renderVillage();
}
