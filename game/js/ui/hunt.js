import { hunt, player } from "../state.js";
import { currentWeapon, getArmorStats, pct } from "../utils.js";
import { ARENAS } from "../data/arenas.js";
import { hitzoneHints } from "../hunt/parts.js";
import { renderLog } from "../hunt/log.js";
import { renderTopbar } from "./topbar.js";
import { HAZARDS } from "../hunt/combat/hazards.js";
import { movesetFor } from "../data/playermoves.js";

/* ---------- HUNT SCREEN RENDER ---------- */

export function renderHunt() {
  document.getElementById("village-screen").classList.add("hidden");
  const h = document.getElementById("hunt-screen");
  h.classList.remove("hidden");

  const m = hunt.monster;
  const rank = hunt.rank;
  const weapon = currentWeapon();
  const arena = ARENAS[m.arenaKey];
  const hazard = HAZARDS[arena.hazard];

  // Move selection lives on hunt (not local state) so it survives re-renders
  // and resets naturally each new hunt via setup.js's fresh hunt object.
  const moveset = movesetFor(weapon);
  if (
    !hunt.selectedMoveKey ||
    !moveset.moves.some((mv) => mv.key === hunt.selectedMoveKey)
  ) {
    hunt.selectedMoveKey = moveset.moves[0].key;
  }
  const selectedMove = moveset.moves.find(
    (mv) => mv.key === hunt.selectedMoveKey,
  );
  const selectedCost = Math.round(
    selectedMove.staminaCost * (weapon.staminaMult ?? 1),
  );
  const canAffordSelected = player.stamina >= selectedCost;

  const moveSelectHtml = moveset.moves
    .map((mv) => {
      const cost = Math.round(mv.staminaCost * (weapon.staminaMult ?? 1));
      const active = mv.key === hunt.selectedMoveKey;
      return `
      <button class="move-pick ${active ? "selected" : ""}" onclick="selectMove('${mv.key}')">
        <div class="move-name">${mv.name}</div>
        <div class="move-desc">${mv.desc}</div>
        <div class="move-cost">${cost} stamina</div>
      </button>
    `;
    })
    .join("");

  const partsHtml = m.parts
    .map((p) => {
      const locked =
        p.requiresBroken &&
        !m.parts.find((x) => x.key === p.requiresBroken).broken;
      let tag = "";
      if (p.broken && p.postBreakImmune)
        tag = '<span class="part-tag spent">SPENT</span>';
      else if (p.broken) tag = '<span class="part-tag exposed">EXPOSED</span>';
      else if (locked) tag = '<span class="part-tag armored">ARMORED</span>';
      const hints = hitzoneHints(p)
        .map((hn) => `<span class="hint-chip">${hn}</span>`)
        .join("");
      const attackDisabled = canAffordSelected ? "" : "disabled";
      return `
      <div class="card part-card ${p.broken ? "broken" : ""}">
        <div class="pname"><span>${p.name}</span>${tag}</div>
        <div class="barwrap" style="margin-top:6px;">
          <div class="barfill ${p.broken ? "broken" : "part"}" style="width:${pct(p.hp, p.maxHp)}%"></div>
        </div>
        <div class="hint-row">${hints}</div>
        <button class="wide" style="margin-top:8px;" onclick="playerAction('attack',{partKey:'${p.key}',moveKey:'${hunt.selectedMoveKey}'})" ${attackDisabled}>${selectedMove.name} → ${p.name.toLowerCase()}</button>
      </div>
    `;
    })
    .join("");

  const telegraphHtml = hunt.pendingMove
    ? `
    <div class="telegraph-banner">
      <span class="tt-label">Incoming — ${hunt.pendingMove.blockable ? "blockable" : "must be dodged"}</span>
      ${hunt.pendingMove.telegraph}
      <div style="margin-top:6px; color:var(--frost);">React now: ${hunt.pendingMove.blockable ? "guard or dodge" : "dodge only"}.</div>
    </div>
  `
    : hunt.recoveryWindow
      ? `
    <div class="telegraph-banner" style="border-color:var(--moss-dim); color:var(--moss);">
      <span class="tt-label">Tempo opening</span>
      The monster is still recovering. Press another attack while the opening lasts.
    </div>
  `
      : `
    <div class="telegraph-banner" style="border-color:var(--border); color:var(--text-dim);">
      <span class="tt-label">Reading the field</span>
      No move telegraphed yet — act to see what it does next.
    </div>
  `;

  let hazardHint = "";
  if (hazard) {
    const { every, warnText } = hazard;
    if (hunt.sandstormActive) {
      hazardHint = `<div class="hazard-note">Sandstorm active — perfect dodge is reduced to partial this turn.</div>`;
    } else if (hunt.turnCount > 0 && hunt.turnCount % every === every - 1) {
      hazardHint = `<div class="hazard-note">${warnText}</div>`;
    }
  }

  const loadoutHint = `
    <div class="loadout-note">
      <div class="tactic-pill">Weapon style: ${weapon.specialDesc}</div>
      <div class="tactic-pill">Armor: ${getArmorStats().def} DEF · fire ${getArmorStats().resist.fire}% · ice ${getArmorStats().resist.ice}%</div>
    </div>
    ${hazardHint}
  `;

  h.innerHTML = `
    <div class="panel">
      <div class="arena-tag">${rank.toUpperCase()} • ${arena.name} — ${arena.desc}</div>
      <div class="monster-head">
        <span class="micon">${m.icon}</span>
        <div>
          <span class="mname">${m.name}</span>
          ${m.enraged ? '<span class="mtag">Enraged</span>' : ""}
        </div>
      </div>
      <div class="barlabel"><span>Vitality</span><span>${m.hp} / ${m.maxHp}</span></div>
      <div class="barwrap"><div class="barfill hp" style="width:${pct(m.hp, m.maxHp)}%"></div></div>

      ${telegraphHtml}
      ${loadoutHint}

      <div class="action-group-label">Choose your move</div>
      <div class="move-select">${moveSelectHtml}</div>

      <div class="action-group-label">Then target a part</div>
      <div class="parts-grid">${partsHtml}</div>

      <div class="player-status">
        <div class="col">
          <div class="barlabel"><span>Your HP</span><span>${player.hp} / ${player.maxHp}</span></div>
          <div class="barwrap"><div class="barfill hp" style="width:${pct(player.hp, player.maxHp)}%"></div></div>
        </div>
        <div class="col">
          <div class="barlabel"><span>Stamina</span><span>${player.stamina} / ${player.maxStamina}</span></div>
          <div class="barwrap"><div class="barfill stam" style="width:${pct(player.stamina, player.maxStamina)}%"></div></div>
        </div>
      </div>

      <div class="action-group-label">Attack or react to the telegraph</div>
      <div class="actions">
        <button class="dodge" onclick="playerAction('dodge',{dir:'left'})">Dodge left</button>
        <button class="dodge" onclick="playerAction('dodge',{dir:'right'})">Dodge right</button>
        <button class="dodge" onclick="playerAction('dodge',{dir:'back'})">Dodge back</button>
      </div>

      <div class="action-group-label">Other actions</div>
      <div class="actions">
        <button onclick="playerAction('guard')">Guard</button>
        <button onclick="playerAction('item')" ${player.potions <= 0 || hunt.pendingMove ? "disabled" : ""}>Use potion (${player.potions})</button>
        <button onclick="playerAction('flee')">Flee hunt</button>
      </div>
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">Weapon: ${weapon.name} (ATK ${weapon.atk}) · ${selectedMove.name} costs ${selectedCost} stamina · dodging ignores your weapon's swing this round</div>

      <div id="hunt-log" class="log"></div>
    </div>
  `;
  renderLog();
  renderTopbar();
}

/**
 * Sets which move the part-attack buttons below will use. Purely a UI
 * selection — doesn't spend a turn, doesn't call playerAction — so it's
 * safe to change mid-telegraph while reacting to a monster's pending move.
 */
export function selectMove(moveKey) {
  hunt.selectedMoveKey = moveKey;
  renderHunt();
}
