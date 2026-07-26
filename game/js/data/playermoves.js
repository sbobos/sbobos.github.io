/* ==========================================================================
   PLAYER MOVE DATABASE

   A weapon's Mechanism part carries a `moveset` key (see js/data/weaponParts.js).
   That key looks up an entry here, which lists the moves available while
   that weapon is equipped. Mirrors the monster MOVES pattern in
   js/data/moves.js on purpose: pure data, combat code should only read
   these fields, never branch on move.key directly.

   Currently only the "standard" moveset exists — every Mechanism today
   points at it (see weaponParts.js), same "catalog exists, only starter
   populated" pattern as HANDLES having just steadyGrip. Future Mechanisms
   can point at their own moveset key here to grant weapon-specific move
   pools, the same way MECHANISMS.special/specialDesc already differ per
   weapon without touching this file.

   --------------------------------------------------------------------------
   Fields

   key             Internal identifier. Passed as moveKey alongside partKey:
                   playerAction('attack', {moveKey, partKey}).

   name            Display name for the move-select menu.

   desc            Short flavor/mechanical blurb shown under the move button.

   staminaCost     Stamina spent attempting this move. Move is unusable
                   (same failure path as today's flat-cost check) if the
                   player doesn't have enough.

   damageMult      Multiplier applied to the weapon's normally-calculated
                   damage (physical + elemental), before crit/special.

   critRateMod     Added to COMBAT.CRIT_RATE for this move only. Can be
                   negative.

   ========================================================================== */

export const MOVESETS = {
  standard: {
    key: "standard",
    moves: [
      {
        key: "light_slash",
        name: "Light Slash",
        desc: "Fast, low-commitment strike. Cheap on stamina.",
        staminaCost: 12,
        damageMult: 0.7,
        critRateMod: 0,
      },
      {
        key: "heavy_overhead",
        name: "Heavy Overhead",
        desc: "Slow, full-weight swing. Costly, but hits hard.",
        staminaCost: 32,
        damageMult: 1.6,
        critRateMod: 0.05,
      },
    ],
  },
};

/**
 * Resolves a weapon's moveset (as returned by assembleWeapon()) to its
 * move list. Falls back to "standard" so an unrecognized/missing moveset
 * key never leaves the player with an empty move menu.
 */
export function movesetFor(weapon) {
  return MOVESETS[weapon.moveset] ?? MOVESETS.standard;
}