import { hunt, player } from "../state.js";
import { currentWeapon, getArmorStats, pct } from "../utils.js";
import { ARENAS, getArenaTheme } from "../data/arenas.js";
import { hitzoneHints } from "../hunt/parts.js";
import { renderLog } from "../hunt/log.js";
import { renderTopbar } from "./topbar.js";
import { HAZARDS } from "../hunt/combat/hazards.js";
import { movesetFor } from "../data/playermoves.js";
import { renderTimingBarZones } from "../hunt/telegraph.js";

// Helper to structure the theme consistently
function buildThemeObject(themeData) {
  return {
    accent: themeData.to,          // Uses theme's highlight color
    from: themeData.from,          // Direct color from ARENAS
    to: themeData.to || "var(--panel-alt)",
    border: themeData.from,        // Or generate border dynamically
  };
}

/* ---------- HELPER: TELEGRAPH BANNER WITH TIMING BAR ---------- */
function renderTelegraphBanner(move) {
  let guardTag = "";
  if (move.guardResult === "pierce" || move.guardResult === "ignore") {
    guardTag = `<span class="badge danger" style="color:var(--blood); border:1px solid var(--blood); padding:1px 4px; font-size:9px; border-radius:3px;">UNBLOCKABLE</span>`;
  } else if (move.guardResult === "stagger") {
    guardTag = `<span class="badge warning" style="color:var(--gold); border:1px solid var(--gold); padding:1px 4px; font-size:9px; border-radius:3px;">GUARD BREAKER</span>`;
  } else {
    guardTag = `<span class="badge info" style="color:var(--moss); border:1px solid var(--moss); padding:1px 4px; font-size:9px; border-radius:3px;">BLOCKABLE</span>`;
  }

  return `
    <div class="telegraph-banner">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span class="tt-label">${move.name}</span>
        ${guardTag}
      </div>
      <div>${move.telegraph}</div>

      <!-- ACTIVE TIMING BAR -->
      <div class="timing-bar-container" style="margin: 8px 0 4px 0; background: rgba(0,0,0,0.6); height: 10px; border-radius: 5px; position: relative; overflow: hidden; border: 1px solid var(--border);">
        <div id="timing-target-zone" style="position: absolute; left: 55%; width: 30%; height: 100%; background: rgba(122, 154, 110, 0.5); border-left: 2px solid var(--moss); border-right: 2px solid var(--moss);"></div>
        <div id="offset-zone" style="position: absolute; height: 100%; background: rgba(200, 80, 50, 0.6); border-left: 2px solid var(--blood); border-right: 2px solid var(--blood);"></div>
        <div id="timing-progress-bar" style="width: 0%; height: 100%; background: var(--gold);"></div>
      </div>

      <div style="margin-top:2px; display:flex; justify-content:space-between; align-items:center;">
        
        <span style="font-size:9px; color:var(--text-dim);">TIMING IS KEY!</span>
      </div>
    </div>
  `;
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
  const hazard = arena?.hazard ? HAZARDS[arena.hazard] : null;

  const theme = arena?.theme ?? getArenaTheme(m.arenaKey, arena?.name);
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
    ? renderTelegraphBanner(hunt.pendingMove)
    : hunt.recoveryWindow
      ? `
    <div class="telegraph-banner" style="border-color:var(--moss-dim); color:var(--moss);">
      <span class="tt-label">Tempo Opening</span>
      The monster is exhausted and recovering. Take your time to plan an attack!
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
    } else if (every && warnText && hunt.turnCount > 0 && hunt.turnCount % every === every - 1) {
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
          
          <!-- MONSTER STAMINA BAR -->
          <div class="barlabel" style="margin-top:4px;">
            <span>Monster Stamina</span>
            <span>${m.stamina ?? m.maxStamina ?? 100} / ${m.maxStamina ?? 100}</span>
          </div>
          <div class="barwrap mini">
            <div class="barfill stam" style="width:${pct(m.stamina ?? m.maxStamina ?? 100, m.maxStamina ?? 100)}%"></div>
          </div>

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
            <button ${actionsDisabled} onclick="playerAction('item')" ${player.potions <= 0 || hunt.over ? "disabled" : ""}>Potion (${player.potions})</button>
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
  renderTimingBarZones();
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