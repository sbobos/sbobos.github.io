import { hunt } from "../state.js";
import { ARENAS } from "../data/arenas.js";
import { HAZARDS } from "../hunt/combat/hazards.js";
import { chooseMonsterMove } from "./parts.js";
import { logMsg } from "./log.js";

/* ---------- MONSTER TELEGRAPH + ARENA ---------- */

export function monsterTelegraphPhase() {
  hunt.sandstormActive = false;

  const m = hunt.monster;

  const chosen = chooseMonsterMove(m);

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

  const {
    key,

    every,

    warnText,

    triggerText,
  } = arena.hazard;

  const turn = hunt.turnCount;

  const warningTurn = turn % every === every - 1;

  const hazardTurn = turn > 0 && turn % every === 0;

  if (warningTurn) {
    logMsg(warnText, "l-sys");
  } else if (hazardTurn) {
    logMsg(triggerText, "l-sys");

    HAZARDS[key]();
  }
}
