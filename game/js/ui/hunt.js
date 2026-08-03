import { hunt, player } from "../state.js";
import { currentWeapon, getArmorStats, pct } from "../utils.js";
import { ARENAS } from "../data/arenas.js";
import { hitzoneHints } from "../hunt/parts.js";
import { renderLog } from "../hunt/log.js";
import { renderTopbar } from "./topbar.js";
import { HAZARDS } from "../hunt/combat/hazards.js";
import { movesetFor } from "../data/playermoves.js";

/* ---------- HELPER: DYNAMIC ARENA THEMING ---------- */
function getArenaTheme(arenaKey, arenaName = "") {
  const key = (arenaKey || arenaName).toLowerCase();

  if (key.includes("tundra") || key.includes("frost") || key.includes("snow")) {
    return {
      accent: "var(--frost)",
      from: "rgba(111, 155, 176, 0.25)",
      to: "var(--panel-alt)",
      border: "rgba(111, 155, 176, 0.5)",
    };
  }

  if (key.includes("dune") || key.includes("desert") || key.includes("sand")) {
    return {
      accent: "var(--gold-dim)",
      from: "rgba(153, 117, 43, 0.25)",
      to: "var(--panel-alt)",
      border: "var(--gold-dim)",
    };
  }

  if (key.includes("forest") || key.includes("woods") || key.includes("swamp")) {
    return {
      accent: "var(--moss)",
      from: "rgba(122, 154, 110, 0.25)",
      to: "var(--panel-alt)",
      border: "var(--moss-dim)",
    };
  }

  // Default fallback (uses theme object from arena data if available, or border dim)
  return {
    accent: "var(--gold)",
    from: "var(--gold-glow)",
    to: "var(--panel-alt)",
    border: "var(--border)",
  };
}

/* ---------- HUNT SCREEN RENDER ---------- */

export function renderHunt() {
  document.getElementById("village-screen")?.classList.add("hidden");
  const h = document.getElementById("hunt-screen");
  if (!h) return;
  h.classList.remove("hidden");

  const m = hunt.monster;
  const rank = hunt.rank;
  const weapon = currentWeapon();
  const arena = ARENAS[m.arenaKey];
  const hazard = HAZARDS[arena.hazard];

  // Pull theme directly from your ARENAS object (fallback to dark neutral if undefined)
  const theme = arena?.theme ?? { from: "#20201c", to: "var(--panel-alt)" };

  const moveset = movesetFor(weapon);

  if (
    hunt.selectedPartKey &&
    !m.parts.some((p) => p.key === hunt.selectedPartKey)
  ) {
    hunt.selectedPartKey = null;
  }
  const selectedPart = hunt.selectedPartKey
    ? m.parts.find((p) => p.key === hunt.selectedPartKey)
    : null;

  const actionsDisabled = hunt.over ? "disabled" : "";

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
              ${actionsDisabled}
              onclick="selectPart('${p.key}')">
        <div class="hunt-part-icon-name">${p.name}</div>
        <div class="barwrap mini"><div class="barfill ${p.broken ? "broken" : "part"}" style="width:${pct(p.hp, p.maxHp)}%"></div></div>
        ${tag ? `<span class="part-tag ${tag.toLowerCase()}">${tag}</span>` : ""}
      </button>
    `;
    })
    .join("");

  const detailPanelHtml = selectedPart
    ? renderPartDetailPanel(selectedPart, moveset, weapon, actionsDisabled)
    : `
      <div class="part-detail-panel empty" style="padding: 12px; text-align: center; color: var(--text-dim);">
        <p class="section-copy">Select a body part above to target an attack.</p>
      </div>
    `;

  const telegraphHtml = hunt.pendingMove
    ? `
    <div class="telegraph-banner">
      <span class="tt-label">Incoming — ${hunt.pendingMove.blockable ? "blockable" : "must dodge"}</span>
      ${hunt.pendingMove.telegraph}
      <div style="margin-top:4px; color:var(--frost); font-size:10px;">React: ${hunt.pendingMove.blockable ? "guard or dodge" : "dodge only"}.</div>
    </div>
  `
    : hunt.recoveryWindow
      ? `
    <div class="telegraph-banner" style="border-color:var(--moss-dim); color:var(--moss);">
      <span class="tt-label">Tempo opening</span>
      The monster is recovering. Press an attack!
    </div>
  `
      : `
    <div class="telegraph-banner" style="border-color:var(--border); color:var(--text-dim);">
      <span class="tt-label">Reading the field</span>
      No move telegraphed yet — choose an action.
    </div>
  `;

  let hazardHint = "";
  if (hazard) {
    const { every, warnText } = hazard;
    if (hunt.sandstormActive) {
      hazardHint = `<span class="hazard-note" style="color:var(--blood);">Sandstorm Active</span>`;
    } else if (hunt.turnCount > 0 && hunt.turnCount % every === every - 1) {
      hazardHint = `<span class="hazard-note" style="color:var(--gold);">${warnText}</span>`;
    }
  }

  let resultOverlayHtml = "";
  if (hunt.over && hunt.rewardsHtml) {
    resultOverlayHtml = `
      <div class="hunt-overlay-modal">
        <div class="hunt-overlay-card">
          ${hunt.rewardsHtml}
          <div class="overlay-actions" style="margin-top:16px;">
            <button class="primary wide" onclick="continueExpedition()">CONTINUE</button>
          </div>
        </div>
      </div>
    `;
  }

  h.innerHTML = `
    <div class="hunt-grid-layout" style="position:relative;">
      ${resultOverlayHtml}
      
      <!-- LEFT COLUMN -->
      <div class="hunt-col-left">
        <!-- ARENA SCENE PANEL WITH INJECTED GRADIENT VARIABLES -->
        <div class="arena-scene arena-card hunt-panel" style="--scene-from:${theme.from}; --scene-to:${theme.to};">
          <div class="arena-tag">${rank.toUpperCase()} • ${arena.name}</div>
          <div class="monster-head">
            <span class="micon">${m.icon}</span>
            <div>
              <span class="mname">${m.name}</span>
              ${m.enraged ? '<span class="mtag">Enraged</span>' : ""}
            </div>
          </div>
          <div class="barlabel"><span>Monster Vitality</span><span>${m.hp} / ${m.maxHp}</span></div>
          <div class="barwrap"><div class="barfill hp" style="width:${pct(m.hp, m.maxHp)}%"></div></div>
          ${telegraphHtml}
        </div>

        <div class="player-card hunt-panel">
          <div class="player-status" style="margin: 0 0 6px 0;">
            <div class="col">
              <div class="barlabel"><span>Your HP</span><span>${player.hp} / ${player.maxHp}</span></div>
              <div class="barwrap"><div class="barfill hp" style="width:${pct(player.hp, player.maxHp)}%"></div></div>
            </div>
            <div class="col">
              <div class="barlabel"><span>Stamina</span><span>${player.stamina} / ${player.maxStamina}</span></div>
              <div class="barwrap"><div class="barfill stam" style="width:${pct(player.stamina, player.maxStamina)}%"></div></div>
            </div>
          </div>

          <div class="action-group-label">Evasive Reactions</div>
          <div class="actions dodge-grid">
            <button class="dodge" ${actionsDisabled} onclick="playerAction('dodge',{dir:'left'})">Dodge L</button>
            <button class="dodge" ${actionsDisabled} onclick="playerAction('dodge',{dir:'back'})">Dodge Back</button>
            <button class="dodge" ${actionsDisabled} onclick="playerAction('dodge',{dir:'right'})">Dodge R</button>
          </div>

          <div class="action-group-label">Tactical Actions</div>
          <div class="actions util-grid">
            <button ${actionsDisabled} onclick="playerAction('guard')">Guard</button>
            <button ${actionsDisabled} onclick="playerAction('item')" ${player.potions <= 0 || hunt.pendingMove || hunt.over ? "disabled" : ""}>Potion (${player.potions})</button>
            <button ${actionsDisabled} onclick="playerAction('flee')">Flee</button>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="hunt-col-right">
        <div class="targeting-card hunt-panel">
          <div class="action-group-label" style="margin-top:0;">Target Body Part</div>
          <div class="icon-strip hunt-icon-strip" style="margin: 4px 0 8px;">${partIconsHtml}</div>
          ${detailPanelHtml}
        </div>

        <div class="log-card hunt-panel">
          <div class="loadout-bar">
            <span>Style: <strong>${weapon.specialDesc}</strong></span>
            <span>Armor DEF: <strong>${getArmorStats().def}</strong> (F:${getArmorStats().resist.fire}% I:${getArmorStats().resist.ice}%)</span>
            ${hazardHint}
          </div>
          <div id="hunt-log" class="log"></div>
        </div>
      </div>

    </div>
  `;

  renderLog();
  renderTopbar();
}

function renderPartDetailPanel(part, moveset, weapon, actionsDisabled) {
  const hints = hitzoneHints(part)
    .map((hn) => `<span class="hint-chip">${hn}</span>`)
    .join("");

  const moveListHtml = moveset.moves
    .map((mv) => {
      const cost = Math.round(mv.staminaCost * (weapon.staminaMult ?? 1));
      const disabled =
        player.stamina < cost || actionsDisabled !== "" ? "disabled" : "";
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
      <div class="part-card ${part.broken ? "broken" : ""}" style="margin-bottom:8px;">
        <div class="pname">
          <span>${part.name}</span>
          <div class="hint-row" style="margin:0;">${hints}</div>
        </div>
        <div class="barwrap mini" style="margin-top:4px;">
          <div class="barfill ${part.broken ? "broken" : "part"}" style="width:${pct(part.hp, part.maxHp)}%"></div>
        </div>
      </div>
      <div class="action-group-label" style="margin-top:0;">Choose Move</div>
      <div class="move-select-grid">${moveListHtml}</div>
    </div>
  `;
}

export function selectPart(partKey) {
  if (hunt.over) return;
  hunt.selectedPartKey = partKey;
  renderHunt();
}