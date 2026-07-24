import { player, story, setPlayer, setStory } from "../state.js";
import { MONSTERS } from "../data/monsters.js";
import { ARENAS } from "../data/arenas.js";
import { WEAPONS, ARMORS } from "../data/gear.js";
import { STORY_MISSIONS } from "../data/story.js";
import { SIDE_MISSIONS } from "../data/sidequests.js";
import { currentWeapon, currentArmor, addMat } from "../utils.js";
import { generateSaveCode, loadSaveCode } from "../save.js";
import { renderTopbar } from "./topbar.js";
import { renderCampTab } from "./camp.js";
import { generateSideExpedition } from "../hunt/sidequestgenerator.js";
import { registerMission } from "../questregistry.js";

/* ---------- VILLAGE SCREEN STATE ---------- */
let villageTab = "quests";
let cachedEntries = null;
let cachedBoardKey = null;

export function setVillageTab(tab) {
  villageTab = tab;
  renderVillage();
}

export function renderVillage() {
  document.getElementById("hunt-screen").classList.add("hidden");
  const v = document.getElementById("village-screen");
  v.classList.remove("hidden");

  const tabs = [
    ["quests", "Quest Board"],
    ["forge", "Forge"],
    ["camp", "Camp"],
    ["inventory", "Inventory"],
    ["save", "Save / Load"],
  ];
  const tabBar = `
    <div class="actions" style="grid-template-columns:repeat(5,1fr); margin-bottom:18px;">
      ${tabs.map(([key, label]) => `<button class="${villageTab === key ? "primary" : ""}" onclick="setVillageTab('${key}')">${label}</button>`).join("")}
    </div>
  `;

  let body = "";
  if (villageTab === "quests") body = renderQuestsTab();
  else if (villageTab === "forge") body = renderForgeTab();
  else if (villageTab === "camp") body = renderCampTab();
  else if (villageTab === "inventory") body = renderInventoryTab();
  else if (villageTab === "save") body = renderSaveTab();

  v.innerHTML = tabBar + body;
  renderTopbar();
}

export function getActiveStoryMission() {
  return (
    STORY_MISSIONS.find((m) => m.key === story.activeMissionKey) ||
    STORY_MISSIONS[0]
  );
}

export function refreshQuestBoard() {
  cachedEntries = null;
  renderVillage();
}

export function getQuestBoardEntries() {
  const activeMission = getActiveStoryMission();
  const boardKey = `${activeMission.key}:${story.chapter}`;

  if (cachedEntries && cachedBoardKey === boardKey) {
    return cachedEntries;
  }

  const entries = [];

  registerMission(activeMission);
  entries.push({
    type: "main",
    mission: activeMission,
    monster: MONSTERS[activeMission.monsterId],
    label: "Main Objective",
  });

  const sidePool = Object.entries(MONSTERS)
    .filter(([id]) => id !== activeMission.monsterId)
    .filter(([id]) => {
      const mission = STORY_MISSIONS.find((item) => item.monsterId === id);
      return !mission || mission.chapter <= story.chapter;
    })
    .map(([id, monster]) => ({ id, monster }));

  const shuffled = [...sidePool].sort(() => Math.random() - 0.5);
  const limit = Math.min(2, shuffled.length);

  for (let i = 0; i < limit; i += 1) {
    const { id, monster } = shuffled[i];

    const manualMission = SIDE_MISSIONS.find(
      (m) => m.monsterId === id && m.unlockChapter <= story.chapter,
    );

    const mission =
      manualMission ?? generateSideExpedition(id, monster.arenaKey, "normal");

    registerMission(mission);

    entries.push({
      type: "side",
      mission,
      monster,
      label: manualMission ? "Side Hunt" : "Bounty",
    });
  }

  cachedEntries = entries;
  cachedBoardKey = boardKey;

  return entries;
}

export function renderQuestsTab() {
  const activeMission = getActiveStoryMission();
  const questCards = getQuestBoardEntries()
    .map((entry) => {
      const monster = entry.monster;
      const mission = entry.mission;
      const actionLabel =
        entry.type === "main" ? "Take assignment" : "Accept hunt";
      const subtitle =
        entry.type === "main"
          ? `${activeMission.description}`
          : mission.description || "A fresh lead has surfaced nearby.";
      return `
      <div class="card quest-card">
        <div><span class="qicon">${monster.icon}</span><span class="qname">${monster.name}</span></div>
        <div class="qflavor">${monster.flavor}</div>
        <div class="qarena">Territory: ${ARENAS[monster.arenaKey].name}</div>
        <div class="story-pill">${entry.label}</div>
        <div class="story-subtitle">${subtitle}</div>
        <button class="primary wide" onclick="startExpedition('${mission.key}')">${actionLabel}</button>
      </div>
    `;
    })
    .join("");

  return `
    <div class="panel">
      <h2>Quest Board</h2>
      <p class="section-copy">Your current assignment is the core of the story. The rest of the board shifts as the region opens up.</p>
      <div class="story-banner">
        <div class="story-title">Story progress</div>
        <div class="story-copy">Chapter ${story.chapter} · ${activeMission.title}</div>
        <div class="story-copy">${activeMission.description}</div>
      </div>
      <div class="quest-grid">${questCards}</div>
    </div>
  `;
}

export function renderForgeTab() {
  const weaponCards = Object.values(WEAPONS)
    .map((item) => renderCraftCard(item, true))
    .join("");
  const armorCards = Object.values(ARMORS)
    .map((item) => renderCraftCard(item, false))
    .join("");
  const current = currentWeapon();
  const treeSummary = `
    <div class="stat-row">
      <div class="stat-chip">Weapon: ${current.name}</div>
      <div class="stat-chip">Head: ${currentArmor().head.name}</div>
      <div class="stat-chip">Body: ${currentArmor().body.name}</div>
      <div class="stat-chip">Style: ${current.specialDesc}</div>
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

export function renderInventoryTab() {
  const weaponCards = player.ownedWeapons
    .map((key) => {
      const item = WEAPONS[key];
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
          <div class="shop-desc">Weapon: ${currentWeapon().name} · Head: ${currentArmor().head.name} · Body: ${currentArmor().body.name}</div>
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
  const currentItem = isWeapon
    ? currentWeapon()
    : item.slot === "head"
      ? currentArmor().head
      : currentArmor().body;
  const compareText = isWeapon
    ? `vs current: ${item.atk - currentItem.atk >= 0 ? "+" : ""}${item.atk - currentItem.atk} ATK`
    : `vs current: ${item.def - currentItem.def >= 0 ? "+" : ""}${item.def - currentItem.def} DEF`;

  let reqRows = "";
  let allOk = true;
  if (!owned && item.recipe) {
    const zennyOk = player.zenny >= item.zenny;
    allOk =
      zennyOk &&
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
        <li class="${zennyOk ? "ok" : "bad"}"><span>Zenny</span><span>${player.zenny}/${item.zenny}</span></li>
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
                : "")
        }
        ${!owned && item.recipe ? " · " + item.zenny + "z" : ""}
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
      player.zenny >= item.zenny &&
      Object.entries(item.recipe).every(
        ([mat, need]) => (player.materials[mat] || 0) >= need,
      );
    if (!canAfford) return;
    player.zenny -= item.zenny;
    Object.entries(item.recipe).forEach(([mat, need]) => addMat(mat, -need));
    ownedList.push(key);
  }
  if (isWeapon) player.weapon = key;
  else {
    const slot = item.slot || "body";
    player.armorSlots[slot] = key;
  }
  renderVillage();
}

export function renderStatusTab() {
  const w = currentWeapon();
  const armor = currentArmor();
  const matEntries = Object.entries(player.materials).filter(([, n]) => n > 0);
  const invHtml = matEntries.length
    ? `<div class="inv-grid">${matEntries.map(([n, c]) => `<div class="inv-item"><span>${n}</span><span class="n">x${c}</span></div>`).join("")}</div>`
    : `<div class="inv-empty">No materials yet — go carve something.</div>`;

  const s = player.stats || { hunts: 0, victories: 0, fled: 0, defeats: 0 };

  return `
    <div class="panel">
      <h2>Hunter</h2>
      <div class="equip-row">
        <div>Max HP: <b>${player.maxHp}</b></div>
        <div>Max Stamina: <b>${player.maxStamina}</b></div>
        <div>Zenny: <b>${player.zenny}</b></div>
        <div>Potions: <b>${player.potions}</b></div>
      </div>
    </div>
    <div class="panel">
      <h2>Equipped Gear</h2>
      <div class="equip-row" style="flex-direction:column; gap:6px;">
        <div>Weapon: <b>${w.name}</b> — ATK ${w.atk}, ${w.damageType}${w.element !== "none" ? `, +${w.elementPower} ${w.element}` : ""}</div>
        <div>Head: <b>${armor.head.name}</b> — DEF ${armor.head.def}${
          armor.head.resist.fire || armor.head.resist.ice
            ? ", resist " +
              Object.entries(armor.head.resist)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => k + " " + v + "%")
                .join(", ")
            : ""
        }</div>
        <div>Body: <b>${armor.body.name}</b> — DEF ${armor.body.def}${
          armor.body.resist.fire || armor.body.resist.ice
            ? ", resist " +
              Object.entries(armor.body.resist)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => k + " " + v + "%")
                .join(", ")
            : ""
        }</div>
      </div>
    </div>
    <div class="panel">
      <h2>Hunt Log</h2>
      <div class="equip-row">
        <div>Hunts: <b>${s.hunts}</b></div>
        <div>Victories: <b>${s.victories}</b></div>
        <div>Fled: <b>${s.fled}</b></div>
        <div>Defeats: <b>${s.defeats}</b></div>
      </div>
    </div>
    <div class="panel">
      <h2>Materials</h2>
      ${invHtml}
    </div>
  `;
}

export function renderSaveTab() {
  return `
    <div class="panel">
      <h2>Save game</h2>
      <p style="font-size:12px; color:var(--text-dim); margin:0 0 10px;">
        Generates a portable save code (your gear, materials, zenny, and stats). Copy it somewhere safe —
        pasting it back below restores that exact state. No browser storage is used, so this works the same
        whether you're playing here or from a saved copy of the file.
      </p>
      <button class="primary" onclick="doGenerateSave()">Generate save code</button>
      <textarea id="save-code-box" readonly rows="4" style="width:100%; margin-top:10px; font-family:var(--font-mono); font-size:11px; background:#0d1210; color:var(--text); border:1px solid var(--border); border-radius:4px; padding:8px;" placeholder="Your save code will appear here."></textarea>
      <div id="save-status" style="font-size:11px; color:var(--moss); margin-top:6px; min-height:14px;"></div>
    </div>
    <div class="panel">
      <h2>Load game</h2>
      <p style="font-size:12px; color:var(--text-dim); margin:0 0 10px;">Paste a save code below and load it.</p>
      <textarea id="load-code-box" rows="4" style="width:100%; font-family:var(--font-mono); font-size:11px; background:#0d1210; color:var(--text); border:1px solid var(--border); border-radius:4px; padding:8px;" placeholder="Paste your IRONVEIL1:... code here"></textarea>
      <button class="primary" style="margin-top:10px;" onclick="doLoadSave()">Load save code</button>
      <div id="load-status" style="font-size:11px; margin-top:6px; min-height:14px;"></div>
    </div>
    <div class="panel">
      <h2>New game</h2>
      <p style="font-size:12px; color:var(--text-dim); margin:0 0 10px;">Wipes zenny, gear, and materials back to a fresh Hunter's Blade and Cloth Vest.</p>
      <button onclick="doNewGame()">Start a new hunter</button>
    </div>
  `;
}

export function doGenerateSave() {
  const code = generateSaveCode();
  const box = document.getElementById("save-code-box");
  const status = document.getElementById("save-status");
  if (!code) {
    status.textContent = "Could not generate a save code.";
    status.style.color = "var(--blood)";
    return;
  }
  box.value = code;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        status.textContent = "Copied to clipboard.";
        status.style.color = "var(--moss)";
      })
      .catch(() => {
        status.textContent =
          "Code generated — copy it manually from the box above.";
        status.style.color = "var(--moss)";
      });
  } else {
    box.select();
    status.textContent =
      "Code generated — copy it manually from the box above.";
    status.style.color = "var(--moss)";
  }
}

export function doLoadSave() {
  const code = document.getElementById("load-code-box").value;
  const status = document.getElementById("load-status");
  const ok = loadSaveCode(code);
  if (ok) {
    cachedEntries = null;
    status.textContent = "Save loaded.";
    status.style.color = "var(--moss)";
    renderVillage();
  } else {
    status.textContent = "That code didn't load — check you copied it in full.";
    status.style.color = "var(--blood)";
  }
}

export function doNewGame() {
  setPlayer({
    name: "Hunter",
    maxHp: 120,
    hp: 120,
    maxStamina: 100,
    stamina: 100,
    weapon: "basic",
    armorSlots: { head: "headband", body: "basic" },
    ownedWeapons: ["basic"],
    ownedArmors: ["basic", "headband"],
    zenny: 60,
    potions: 3,
    materials: {},
    stats: { hunts: 0, victories: 0, fled: 0, defeats: 0 },
    trophies: {},
  });
  setStory({
    chapter: 1,
    activeMissionKey: "intro_boar",
    completedMissionKeys: [],
    unlockedMissionKeys: ["intro_boar"],
  });
  cachedEntries = null;
  renderVillage();
}
