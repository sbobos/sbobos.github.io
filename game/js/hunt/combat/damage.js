import { rand, currentWeapon } from "../../utils.js";
import { hitzoneMultiplier } from "../parts.js";
import { COMBAT } from "./constants.js";

export function calculateAttack(part, move) {
  const weapon = currentWeapon();

  const multiplier = hitzoneMultiplier(part);

  const physical =
    weapon.atk *
    (part.hitzone[weapon.damageType] / 100) *
    multiplier *
    (weapon.physicalMult ?? 1);

  const elemental =
    weapon.element === "none"
      ? 0
      : weapon.elementPower * (part.hitzone[weapon.element] / 100) * multiplier;

  let damage = Math.round(
    (physical + elemental) *
      (move.damageMult ?? 1) *
      rand(COMBAT.DAMAGE_VARIANCE_MIN, COMBAT.DAMAGE_VARIANCE_MAX),
  );

  const critRate =
    COMBAT.CRIT_RATE + (weapon.critMod ?? 0) + (move.critRateMod ?? 0);
  const crit = Math.random() < critRate;

  if (crit) {
    damage = Math.round(damage * COMBAT.CRIT_MULTIPLIER);
  }

  const signature = getSignatureEffect(move, part, crit);

  damage += signature.extraDamage;

  damage = Math.max(1, damage);

  return {
    weapon,
    move,
    damage,
    crit,
    special: signature,
  };
}

/* ---------- MOVE-INTRINSIC SIGNATURE EFFECTS ----------
   Retired specials.js. These effects now live directly on the move that
   grants them (see js/data/playerMoves.js) instead of a shared
   weapon.special lookup — a move carries whichever of these fields apply,
   or none at all. Combat code only reads field presence, never a move key.
*/
function getSignatureEffect(move, part, crit) {
  let extraDamage = 0;
  let note = "";

  if (move.bonusVsBrokenPart && part.broken) {
    extraDamage += move.bonusVsBrokenPart;
    note = "The follow-through drives extra force into the exposed wound.";
  }

  if (move.bonusOnCrit && crit) {
    extraDamage += move.bonusOnCrit;
    note = note
      ? note + " The cut lands true."
      : "The cut lands true, biting deep.";
  }

  if (move.bonusVsElementWeak) {
    const { element, threshold, amount } = move.bonusVsElementWeak;
    if ((part.hitzone[element] ?? 0) >= threshold) {
      extraDamage += amount;
      note = note
        ? note + " Fire-weakened flesh gives way."
        : "Fire-weakened flesh gives way easily.";
    }
  }

  if (move.procChance && Math.random() < move.procChance) {
    extraDamage += move.procBonus ?? 0;
    note = "The swing overwhelms the target with unexpected force.";
  }

  return { extraDamage, note };
}
