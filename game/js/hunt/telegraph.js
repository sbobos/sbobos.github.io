import { hunt } from "../state.js";
import { ARENAS } from "../data/arenas.js";
import { HAZARDS } from "../hunt/combat/hazards.js";
import { chooseMonsterMove } from "./parts.js";
import { logMsg } from "./log.js";

/* ---------- REAL-TIME TIMING STATE ---------- */
let activeAnimationFrame = null;
let timingProgressPct = 0;
let timingActive = false;
let onTimeoutCallback = null;
let activePlayerMove = null; // 👈 1. Add state to store current move[cite: 1]

export function setTimingTimeoutCallback(fn) {
  onTimeoutCallback = fn;
}

/* ---------- MONSTER TELEGRAPH + ARENA ---------- */

export function monsterTelegraphPhase() {
  const m = hunt.monster;

  // 1. Always tick the turn count and check arena hazards FIRST
  hunt.turnCount++;
  checkArenaHazard();

  // 2. Initialize stamina & exhaustion state
  m.maxStamina = m.maxStamina ?? 100;

  if (m.stamina === undefined) {
    m.stamina = m.maxStamina;
    m.isExhausted = false;
  } else {
    m.stamina = Math.min(m.stamina, m.maxStamina);
  }

  // 3. Trigger exhaustion as soon as stamina hits 0
  if (m.stamina <= 0) {
    m.isExhausted = true;
  }

  // 4. EXHAUSTED STATE
  if (m.isExhausted) {
    const regenAmount = Math.round(m.maxStamina * 0.5);
    m.stamina = Math.min(m.maxStamina, m.stamina + regenAmount);

    hunt.pendingMove = null;
    hunt.recoveryWindow = true;

    if (m.stamina < m.maxStamina) {
      logMsg(
        `${m.name.toUpperCase()} is exhausted and panting (${m.stamina}/${m.maxStamina} Stamina)! Press your attack!`,
        "l-good"
      );
    } else {
      m.isExhausted = false;
      logMsg(
        `${m.name.toUpperCase()} has fully caught its breath (${m.stamina}/${m.maxStamina}) and readies its next rampage!`,
        "l-sys"
      );
    }

    return; // Safely exit here AFTER the hazard has processed!
  }

  // 5. ATTACK PHASE
  const chosen = chooseMonsterMove(m, hunt.rank);

  // Dynamic Stamina Drain: Priority sequence checks:
  // 1. Specific stamina cost defined on the move object
  // 2. Monster-level flat stamina cost (if defined on m.perTurnStamina)
  // 3. Fallback default of 35
  const staminaCost = chosen.staminaCost ?? m.perTurnStamina ?? 35;
  m.stamina = Math.max(0, m.stamina - staminaCost);

  // --- RANDOMIZE DODGE & OFFSET TIMING ZONES ---
  const dodgeStart = Math.floor(Math.random() * 40) + 30;
  const dodgeWidth = 20;

  const offsetOffset = Math.floor(Math.random() * 15) - 5;
  const offsetStart = Math.max(10, Math.min(80, dodgeStart + offsetOffset));
  const offsetWidth = 4;

  hunt.pendingMove = {
    ...chosen,
    blockable: chosen.guardResult === "block",
    targetZoneStart: dodgeStart,
    targetZoneEnd: dodgeStart + dodgeWidth,
    offsetZoneStart: offsetStart,
    offsetZoneEnd: offsetStart + offsetWidth,
  };

  hunt.recoveryWindow = false;
  logMsg(chosen.telegraph, "l-telegraph");

  hunt.turnCount++;
  checkArenaHazard();
}

export function checkArenaHazard() {
  const arena = ARENAS[hunt.monster.arenaKey];
  if (!arena?.hazard) return;

  // If hazard is an object like { key: "sandstorm" }, extract key; otherwise use as string
  const hazardKey = typeof arena.hazard === "object" ? arena.hazard.key || arena.hazard.type : arena.hazard;

  const hazard = HAZARDS[hazardKey];
  if (!hazard) {
    console.log(`⚠️ Hazard key "${hazardKey}" not found in HAZARDS dictionary.`);
    return;
  }

  console.log(`✅ Hazard active: ${arena.hazard} | Turn: ${hunt.turnCount} / Every: ${hazard.every}`);

  const { every, warnText, triggerText } = hazard;
  const turn = hunt.turnCount;

  const warningTurn = turn % every === every - 1;
  const hazardTurn = turn > 0 && turn % every === 0;

  if (warningTurn && warnText) {
    logMsg(warnText, "l-sys");
  } else if (hazardTurn) {
    if (triggerText) logMsg(triggerText, "l-sys");
    if (typeof hazard.execute === "function") {
      hazard.execute();
    }
  }
}

export function renderTimingBarZones() {
  const move = hunt.pendingMove;
  if (!move) return;

  const dodgeZoneEl = document.getElementById("timing-target-zone");
  if (dodgeZoneEl) {
    dodgeZoneEl.style.left = `${move.targetZoneStart}%`;
    dodgeZoneEl.style.width = `${move.targetZoneEnd - move.targetZoneStart}%`;
  }

  const offsetZoneEl = document.getElementById("offset-zone");
  if (offsetZoneEl) {
    offsetZoneEl.style.left = `${move.offsetZoneStart}%`;
    offsetZoneEl.style.width = `${move.offsetZoneEnd - move.offsetZoneStart}%`;
    offsetZoneEl.style.display = "none"; // 👈 Keep hidden when positioned
  }
}

/* ---------- 60FPS REAL-TIME DODGE TIMING MINIGAME ---------- */

let delayTimeout = null;

export function startDodgeTiming(durationMs = 1000, delayMs = 1000) {
  stopDodgeTiming();

  const barEl = document.getElementById("timing-progress-bar");
  const containerEl = document.querySelector(".timing-bar-container");
  const offsetZoneEl = document.getElementById("offset-zone");

  if (barEl) barEl.style.width = "0%";
  if (containerEl) containerEl.classList.add("telegraphing");

  // Force hide immediately upon starting delay
  if (offsetZoneEl) offsetZoneEl.style.display = "none";

  delayTimeout = setTimeout(() => {
    if (containerEl) containerEl.classList.remove("telegraphing");

    // Show offset zone ONLY when progress bar starts moving
    if (offsetZoneEl) offsetZoneEl.style.display = "block";

    timingActive = true;
    timingProgressPct = 0;
    const startTime = performance.now();

    function animate(currentTime) {
      if (!timingActive) return;

      const elapsed = currentTime - startTime;
      timingProgressPct = Math.min(100, (elapsed / durationMs) * 100);

      if (barEl) barEl.style.width = `${timingProgressPct}%`;

      if (timingProgressPct < 100) {
        activeAnimationFrame = requestAnimationFrame(animate);
      } else {
        timingActive = false;
        stopDodgeTiming();
        if (typeof onTimeoutCallback === "function") {
          onTimeoutCallback();
        }
      }
    }

    activeAnimationFrame = requestAnimationFrame(animate);
  }, delayMs);
}

export function stopDodgeTiming() {
  timingActive = false;

  const containerEl = document.querySelector(".timing-bar-container");
  if (containerEl) containerEl.classList.remove("telegraphing");

  const offsetZoneEl = document.getElementById("offset-zone");
  if (offsetZoneEl) offsetZoneEl.style.display = "none"; // 👈 Hide on reset

  if (delayTimeout) {
    clearTimeout(delayTimeout);
    delayTimeout = null;
  }
  if (activeAnimationFrame) {
    cancelAnimationFrame(activeAnimationFrame);
    activeAnimationFrame = null;
  }
}

export function getAndStopTiming(actionType = "dodge", playerMove = null) {
  if (delayTimeout && !timingActive) {
    stopDodgeTiming();
    return "EARLY";
  }

  if (!timingActive || !hunt.pendingMove) return "MISSED";

  const pct = timingProgressPct;
  stopDodgeTiming();

  if (actionType === "attack") {
    // 👈 If the chosen attack move lacks `canOffset: true`, treat it as missed/standard attack
    if (!playerMove?.canOffset) {
      return "MISSED";
    }

    const offsetStart = hunt.pendingMove.offsetZoneStart ?? 50;
    const offsetEnd = hunt.pendingMove.offsetZoneEnd ?? 60;

    if (pct >= offsetStart && pct <= offsetEnd) return "PERFECT";
    return "MISSED";
  }

  // Dodge window checking
  const start = hunt.pendingMove.targetZoneStart ?? 55;
  const end = hunt.pendingMove.targetZoneEnd ?? 85;

  if (pct >= start && pct <= end) return "PERFECT";
  if (pct >= start - 20 && pct < start) return "EARLY";
  return "MISSED";
}