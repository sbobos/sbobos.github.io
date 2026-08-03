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

export function setTimingTimeoutCallback(fn) {
  onTimeoutCallback = fn;
}

/* ---------- MONSTER TELEGRAPH + ARENA ---------- */

export function monsterTelegraphPhase() {
  hunt.sandstormActive = false;
  const m = hunt.monster;

  // 1. Initialize Monster Stamina pool if missing
  if (m.stamina === undefined) {
    m.maxStamina = m.maxStamina || 100;
    m.stamina = m.maxStamina;
  }

  // 2. MONSTER EXHAUSTION / RECOVERY CHECK
  if (m.stamina <= 0) {
    m.stamina = m.maxStamina; // Recover stamina back to full
    hunt.pendingMove = null;
    hunt.recoveryWindow = true;

    logMsg(
      `${m.name.toUpperCase()} is exhausted and catching its breath! Press your attack!`,
      "l-good"
    );
    return;
  }

  const chosen = chooseMonsterMove(m, hunt.rank);

  // 3. Consume Monster Stamina (Default 35 per move)
  const staminaCost = chosen.staminaCost ?? 35;
  m.stamina = Math.max(0, m.stamina - staminaCost);

  hunt.pendingMove = {
    ...chosen,
    blockable: chosen.guardResult === "block",
  };

  hunt.recoveryWindow = false;
  logMsg(chosen.telegraph, "l-telegraph");

  hunt.turnCount++;
  checkArenaHazard();
}

export function checkArenaHazard() {
  const arena = ARENAS[hunt.monster.arenaKey];
  if (!arena?.hazard) return;

  const hazard = HAZARDS[arena.hazard];
  if (!hazard) return;

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

/* ---------- 60FPS REAL-TIME DODGE TIMING MINIGAME ---------- */

export function startDodgeTiming(durationMs = 1500) {
  stopDodgeTiming();
  timingActive = true;
  timingProgressPct = 0;

  const startTime = performance.now();

  function animate(currentTime) {
    if (!timingActive) return;

    const elapsed = currentTime - startTime;
    timingProgressPct = Math.min(100, (elapsed / durationMs) * 100);

    const barEl = document.getElementById("timing-progress-bar");
    if (barEl) {
      barEl.style.width = `${timingProgressPct}%`;
    }

    if (timingProgressPct < 100) {
      activeAnimationFrame = requestAnimationFrame(animate);
    } else {
      // TIME EXPIRED! Player failed to react in time
      timingActive = false;
      stopDodgeTiming();
      if (typeof onTimeoutCallback === "function") {
        onTimeoutCallback();
      }
    }
  }

  activeAnimationFrame = requestAnimationFrame(animate);
}

export function getAndStopTiming() {
  if (!timingActive) return "MISSED";

  const pct = timingProgressPct;
  stopDodgeTiming();

  // Green Sweet Spot Zone between 55% and 85%
  if (pct >= 55 && pct <= 85) return "PERFECT";
  if (pct >= 25 && pct < 55) return "EARLY";
  return "MISSED";
}

export function stopDodgeTiming() {
  timingActive = false;
  if (activeAnimationFrame) {
    cancelAnimationFrame(activeAnimationFrame);
    activeAnimationFrame = null;
  }
}