import { hunt } from "../state.js";
import { MOVES } from "../data/moves.js";
import { randInt } from "../utils.js";
import { rankMoveKeys } from "../data/ranks.js";

/* ---------- PART / HITZONE HELPERS ---------- */

export function partBrokenMap(m) {
  const map = {};
  m.parts.forEach((p) => {
    map[p.key] = p.broken;
  });
  return map;
}

export function hitzoneMultiplier(part) {
  let mult = 1;

  if (part.requiresBroken) {
    const prerequisite = hunt.monster.parts.find(
      (p) => p.key === part.requiresBroken,
    );

    if (!prerequisite?.broken) {
      mult *= part.lockedMultiplier ?? 1;
    }
  }

  if (part.broken) mult *= part.exposedMultiplier ?? 1;
  return mult;
}

export function isPartBroken(monster, key) {
  return monster.parts.some((part) => part.key === key && part.broken);
}

export function hitzoneHints(part) {
  const labels = [];
  const physType = part.hitzone.cut >= part.hitzone.blunt ? "Cut" : "Blunt";
  const physVal = Math.max(part.hitzone.cut, part.hitzone.blunt);
  if (physVal >= 45) labels.push("Weak: " + physType);
  if (part.hitzone.fire >= 20) labels.push("Weak: Fire");
  if (part.hitzone.ice >= 20) labels.push("Weak: Ice");
  return labels;
}

/**
 * Starts from this rank's cumulative move pool (base kit + any moves
 * unlocked at this rank or below — see rankMoveKeys in data/ranks.js),
 * then applies the existing break-gated disable/unlock layer on top.
 */
export function availableMoves(m, rank) {
  const active = new Set(rankMoveKeys(m, rank));
  m.parts.forEach((p) => {
    if (p.broken) {
      (p.disablesMoves || []).forEach((k) => active.delete(k));
      if (p.unlocksMove) active.add(p.unlocksMove);
    }
  });
  return [...active].map((k) => MOVES[k]).filter(Boolean);
}

export function pickMove(pool, enraged) {
  let candidates = pool;

  if (enraged) {
    const dmgMoves = pool.filter((mv) => mv.type !== "debuff");
    if (dmgMoves.length && Math.random() < 0.75) {
      candidates = dmgMoves;
    }
  }

  if (candidates.length === 0) {
    throw new Error("Monster has no available moves.");
  }

  return candidates[randInt(0, candidates.length - 1)];
}

export function chooseMonsterMove(monster, rank) {
  const pool = availableMoves(monster, rank);

  console.log({
    monster: monster?.id ?? monster?.name,
    rank,
    pool,
  });

  return pickMove(pool, monster.enraged);
}
