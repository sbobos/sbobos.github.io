import { hunt, player } from '../state.js';
import { headBroken, tailBroken } from './parts.js';
import { logMsg } from './log.js';
import { getArmorStats } from '../utils.js';

/* ---------- RESOLVING THE MONSTER'S TELEGRAPHED MOVE ---------- */

export function resolvePendingMove(actionType, payload){
  const move = hunt.pendingMove;
  const m = hunt.monster;

  if (headBroken(m) && Math.random() < 0.15){
    logMsg("Dazed from its wound, the attack fizzles before it lands!", 'l-good');
    hunt.pendingMove = null;
    hunt.sandstormActive = false;
    return;
  }

  let outcome;
  if (actionType === 'dodge'){
    outcome = (payload.dir === move.dodgeType)
      ? (hunt.sandstormActive ? 'partial' : 'perfect')
      : 'partial';
  } else if (actionType === 'guard' && move.blockable){
    outcome = 'blocked';
  } else if (actionType === 'guard' && !move.blockable){
    outcome = 'guardFail';
  } else {
    outcome = 'full';
  }

  const dmgMult = { perfect:0, partial:0.5, blocked:0.35, guardFail:0.9, full:1 }[outcome];

  if (move.type === 'debuff'){
    const staminaLoss = Math.round(20 * dmgMult);
    player.stamina = Math.max(0, player.stamina - staminaLoss);
    if (outcome === 'perfect') logMsg('You brace through the roar, unshaken.', 'l-good');
    else logMsg(`${move.resolveText} You lose ${staminaLoss} stamina.`, 'l-dmg');
  } else {
    let dmg = Math.round(move.baseDamage * (m.enraged ? 1.25 : 1) * (tailBroken(m) ? 0.9 : 1) * dmgMult);
    if (move.element !== 'none'){
      const armorStats = getArmorStats();
      const resist = armorStats.resist[move.element] || 0;
      dmg = Math.round(dmg * (1 - resist/100));
    }
    if (dmg > 0){
      const armorStats = getArmorStats();
      dmg = Math.max(1, dmg - Math.round(armorStats.def * 0.5));
      player.hp = Math.max(0, player.hp - dmg);
    }
    if (outcome === 'perfect') logMsg(`${move.resolveText} You read it perfectly and dodge clean.`, 'l-good');
    else if (outcome === 'guardFail') logMsg(`${move.resolveText} Your guard does nothing against this — you take ${dmg} damage.`, 'l-dmg');
    else if (dmg > 0) logMsg(`${move.resolveText} You take ${dmg} damage.`, 'l-dmg');
    else logMsg(`${move.resolveText} You avoid it entirely.`, 'l-good');
  }

  hunt.pendingMove = null;
  hunt.sandstormActive = false;
  hunt.pendingMoveWasJustResolved = true;
}
