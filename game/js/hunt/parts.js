import { hunt } from '../state.js';
import { MOVES } from '../data/moves.js';
import { randInt } from '../utils.js';

/* ---------- PART / HITZONE HELPERS ---------- */

export function partBrokenMap(m){
  const map = {};
  m.parts.forEach(p => { map[p.key] = p.broken; });
  return map;
}

export function hitzoneMultiplier(part){
  let mult = 1;
  if (part.requiresBroken && !part.broken){
    const prereq = hunt.monster.parts.find(p => p.key === part.requiresBroken);
    if (!prereq || !prereq.broken) mult *= part.lockedMultiplier;
  }
  if (part.broken) mult *= part.exposedMultiplier;
  return mult;
}

export function headBroken(m){ const p = m.parts.find(p => p.key === 'head'); return p && p.broken; }
export function tailBroken(m){ const p = m.parts.find(p => p.key === 'tail'); return p && p.broken; }

export function hitzoneHints(part){
  const labels = [];
  const physType = part.hitzone.cut >= part.hitzone.blunt ? 'Cut' : 'Blunt';
  const physVal = Math.max(part.hitzone.cut, part.hitzone.blunt);
  if (physVal >= 45) labels.push('Weak: '+physType);
  if (part.hitzone.fire >= 20) labels.push('Weak: Fire');
  if (part.hitzone.ice >= 20) labels.push('Weak: Ice');
  return labels;
}

export function availableMoves(m){
  const active = new Set(m.defaultMoveKeys);
  m.parts.forEach(p => {
    if (p.broken){
      (p.disablesMoves||[]).forEach(k => active.delete(k));
      if (p.unlocksMove) active.add(p.unlocksMove);
    }
  });
  return [...active].map(k => MOVES[k]).filter(Boolean);
}

export function pickMove(pool, enraged){
  let candidates = pool;
  if (enraged){
    const dmgMoves = pool.filter(mv => mv.type !== 'debuff');
    if (dmgMoves.length && Math.random() < 0.75) candidates = dmgMoves;
  }
  return candidates[randInt(0, candidates.length-1)];
}
