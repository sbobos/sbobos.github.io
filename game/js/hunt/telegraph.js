import { hunt } from "../state.js";
import { ARENAS } from "../data/arenas.js";
import { chooseMonsterMove } from "./parts.js";
import { logMsg } from "./log.js";

/* ---------- MONSTER TELEGRAPH + ARENA ---------- */

export function monsterTelegraphPhase() {
  // Ensure arena hazards only apply for the current monster attack, not across multiple turns.
  hunt.sandstormActive = false;

  const m = hunt.monster;
  const chosen = chooseMonsterMove(m);
  hunt.pendingMove = {
    ...chosen,
    blockable: chosen.guardResult === "block"
  };
  hunt.recoveryWindow = false;
  logMsg(chosen.telegraph, "l-telegraph");

  hunt.turnCount++;
  checkArenaHazard();
}

export function checkArenaHazard() {
  const arena = ARENAS[hunt.monster.arenaKey];
  if (!arena || !arena.hazard) return;
  const { every, warnText, triggerText, effect } = arena.hazard;
  const turn =
    hunt.turnCount;
  const warningTurn = turn % every === every - 1;
  const hazardTurn = turn > 0 && turn % every === 0;

  if (warningTurn) {
    logMsg(warnText, "l-sys");
  } else if (hazardTurn) {
    logMsg(triggerText, "l-sys");
    effect();
  }
}
