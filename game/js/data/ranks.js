/* ---------- RANK SCALING ----------
   Each monster in bosses.js owns its rank scaling directly via a
   `ranks: { elite: {...}, master: {...} }` block — hpMult/damageMult
   tuned to that specific species, plus addMoveKeys for attacks that only
   exist at that rank. "normal" is always neutral (1x, no bonus moves) and
   needs no block.

   DEFAULT_RANK_SCALING below is only a fallback for a monster that
   doesn't define its own block yet (e.g. still being tuned, or a small
   monster that never fights above normal rank).

   IMPORTANT — the floor/ceiling rule: whatever hpMult/damageMult you set
   on a monster, the WEAKEST monster's rank-N+1 numbers should still
   exceed the STRONGEST monster's rank-N numbers (across the whole
   roster). Otherwise a "harder rank" fight can end up easier than a
   fight from the rank below it. Re-check this whenever you add a new
   monster or retune an existing one — it's a cross-monster property, not
   something one entry can guarantee on its own.
*/

export const DEFAULT_RANK_SCALING = {
  elite: { hpMult: 2.4, damageMult: 1.3, addMoveKeys: [] },
  master: { hpMult: 5.6, damageMult: 1.6, addMoveKeys: [] },
};

const RANK_ORDER = ["normal", "elite", "master"];

/**
 * Resolves the scaling a monster uses at a given rank. A monster's own
 * ranks[rank] block, if present, fully replaces the default for that rank
 * (not merged field-by-field) — so a monster can intentionally define
 * addMoveKeys without silently inheriting a hpMult that doesn't fit its
 * own HP spread.
 */
export function getRankScaling(monster, rank) {
  if (rank === "normal" || !rank) {
    return { hpMult: 1, damageMult: 1, addMoveKeys: [] };
  }
  return (
    monster.ranks?.[rank] ??
    DEFAULT_RANK_SCALING[rank] ?? { hpMult: 1, damageMult: 1, addMoveKeys: [] }
  );
}

/**
 * Cumulative move pool for a rank — master keeps every move it's ever
 * had, same as real MH: the base kit, plus every addMoveKeys from elite
 * up through the requested rank.
 */
export function rankMoveKeys(monster, rank) {
  const upTo = RANK_ORDER.indexOf(rank);
  const ranksToInclude = upTo === -1 ? [] : RANK_ORDER.slice(1, upTo + 1);

  const added = ranksToInclude.flatMap(
    (r) => getRankScaling(monster, r).addMoveKeys,
  );

  return [...monster.defaultMoveKeys, ...added];
}