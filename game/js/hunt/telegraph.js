import { hunt } from '../state.js';
import { ARENAS } from '../data/arenas.js';
import { availableMoves, pickMove } from './parts.js';
import { logMsg } from './log.js';

/* ---------- MONSTER TELEGRAPH + ARENA ---------- */

export function monsterTelegraphPhase(){
  const m = hunt.monster;
  const pool = availableMoves(m);
  const chosen = pickMove(pool, m.enraged);
  hunt.pendingMove = chosen;
  hunt.recoveryWindow = false;
  logMsg(chosen.telegraph, 'l-telegraph');

  hunt.turnCount++;
  checkArenaHazard();
}

export function checkArenaHazard(){
  const arena = ARENAS[hunt.monster.arenaKey];
  if (!arena || !arena.hazard) return;
  const { every, warnText, triggerText, effect } = arena.hazard;
  const t = hunt.turnCount;
  if (t % every === every - 1){
    logMsg(warnText, 'l-sys');
  } else if (t % every === 0 && t > 0){
    logMsg(triggerText, 'l-sys');
    effect();
  }
}
