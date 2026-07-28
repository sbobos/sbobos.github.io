import { hunt, player } from "../state.js";
import { currentWeapon, getArmorStats, pct } from "../utils.js";
import { ARENAS } from "../data/arenas.js";
import { hitzoneHints } from "../hunt/parts.js";
import { renderLog } from "../hunt/log.js";
import { renderTopbar } from "./topbar.js";
import { HAZARDS } from "../hunt/combat/hazards.js";
import { movesetFor } from "../data/playermoves.js";

/* ---------- HUNT SCREEN RENDER ----------
   Part-first flow: player picks a part from the icon-strip, which opens a
   detail panel listing every move for the current weapon. Picking a move
   there fires the attack immediately — there is no persisted "selected
   move" anymore; the panel always opens neutral per part selection
   (this was an explicit design call, not an oversight).
*/

export function renderHunt() {
  document.getElementById("village-screen").classList.add("hidden");
  const h = document.getElementById("hunt-screen");
  h.classList.remove("hidden");

  const m = hunt.monster;
  const rank = hunt.rank;
  const weapon = currentWeapon();
  const arena = ARENAS[m.arenaKey];
  const hazard = HAZARDS[arena.hazard];
  const theme = arena.theme ?? { from: "#20201c", to: "var(--panel-alt)" };

  const moveset = movesetFor(weapon);

  // Selected part is render-persistent state living on `hunt` (mirrors the
  // old selectedMoveKey pattern) so it survives re-renders but resets clean
  // on every new hunt via setup.js's fresh hunt object.
  if (
    hunt.selectedPartKey &&
    !m.parts.some((p) => p.key === hunt.selectedPartKey)
  ) {
    hunt.selectedPartKey = null;
  }
  const selectedPart = hunt.selectedPartKey
    ? m.parts.find((p) => p.key === hunt.selectedPartKey)
    : null;

  const partIconsHtml = m.parts
    .map((p) => {
      const locked =
        p.requiresBroken &&
        !m.parts.find((x) => x.key === p.requiresBroken).broken;
      let tag = "";
      if (p.broken && p.postBreakImmune) tag = "SPENT";
      else if (p.broken) tag = "EXPOSED";
      else if (locked) tag = "ARMORED";

      const active = p.key === hunt.selectedPartKey;

      return `
      <button class="gear-icon hunt-part-icon ${p.broken ? "broken" : ""} ${active ? "selected" : ""}"
              onclick="selectPart('${p.key}')">
        <div class="hunt-part-icon-name">${p.name}</div>
        <div class="barwrap mini"><div class="barfill ${p.broken ? "broken" : "part"}" style="width:${pct(p.hp, p.maxHp)}%"></div></div>
        ${tag ? `<span class="part-tag ${tag.toLowerCase()}">${tag}</span>` : ""}
      </button>
    `;
    })
    .join("");

  const detailPanelHtml = selectedPart
    ? renderPartDetailPanel(selectedPart, moveset, weapon)
    : `
      <div class="part-detail-panel empty">
        <div class="forge-sprite-placeholder">?</div>
        <p class="section-copy">Select a part above to see hitzone info and choose an attack.</p>
      </div>
    `;

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
      <div class="arena-scene" style="--scene-from:${theme.from};--scene-to:${theme.to};">
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
      </div>

      ${loadoutHint}

      <div class="action-group-label">Choose a part to strike</div>
      <div class="icon-strip hunt-icon-strip">${partIconsHtml}</div>

      ${detailPanelHtml}

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

      <div class="action-group-label">React to the telegraph</div>
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
      <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">Weapon: ${weapon.name} (ATK ${weapon.atk}) · dodging ignores your weapon's swing this round</div>

      <div id="hunt-log" class="log"></div>
    </div>
  `;
  renderLog();
  renderTopbar();
}

function renderPartDetailPanel(part, moveset, weapon) {
  const hints = hitzoneHints(part)
    .map((hn) => `<span class="hint-chip">${hn}</span>`)
    .join("");

  const moveListHtml = moveset.moves
    .map((mv) => {
      const cost = Math.round(mv.staminaCost * (weapon.staminaMult ?? 1));
      const disabled = player.stamina < cost ? "disabled" : "";
      return `
      <button class="move-pick" ${disabled}
              onclick="playerAction('attack',{partKey:'${part.key}',moveKey:'${mv.key}'})">
        <div class="move-name">${mv.name}</div>
        <div class="move-desc">${mv.desc}</div>
        <div class="move-cost">${cost} stamina</div>
      </button>
    `;
    })
    .join("");

  return `
    <div class="part-detail-panel">
      <div class="forge-sprite-placeholder">${part.name}</div>
      <div class="pname"><span>${part.name}</span></div>
      <div class="barwrap" style="margin:6px 0;">
        <div class="barfill ${part.broken ? "broken" : "part"}" style="width:${pct(part.hp, part.maxHp)}%"></div>
      </div>
      <div class="hint-row">${hints}</div>
      <div class="action-group-label">Choose a move</div>
      <div class="move-select">${moveListHtml}</div>
    </div>
  `;
}

/**
 * Sets which part the detail panel below shows. Purely a UI selection —
 * doesn't spend a turn, doesn't call playerAction — so it's safe to change
 * mid-telegraph while reacting to a monster's pending move.
 */
export function selectPart(partKey) {
  hunt.selectedPartKey = partKey;
  renderHunt();
}
