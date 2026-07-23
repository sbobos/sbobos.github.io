import { rand, currentWeapon } from "../../utils.js";
import { hitzoneMultiplier } from "../parts.js";
import { COMBAT } from "./constants.js";
import { getWeaponSpecialEffect } from "./specials.js";

export function calculateAttack(part) {
    const weapon = currentWeapon();

    const multiplier = hitzoneMultiplier(part);

    const physical =
        weapon.atk *
        (part.hitzone[weapon.damageType] / 100) *
        multiplier;

    const elemental =
        weapon.element === "none"
            ? 0
            : weapon.elementPower *
              (part.hitzone[weapon.element] / 100) *
              multiplier;

    let damage = Math.round(
        (physical + elemental) *
        rand(
            COMBAT.DAMAGE_VARIANCE_MIN,
            COMBAT.DAMAGE_VARIANCE_MAX
        )
    );

    console.log("before crit", damage);

    const crit = Math.random() < COMBAT.CRIT_RATE;

    if (crit) {
        damage = Math.round(
            damage *
            COMBAT.CRIT_MULTIPLIER
        );
    }

    const special = getWeaponSpecialEffect(
        weapon,
        part,
        damage,
        crit
    );

    console.log("special", special);

    damage += special.extraDamage;

    console.log("after special", damage);

    damage = Math.max(1, damage);

    console.log("final", damage);

    return {
        weapon,
        damage,
        crit,
        special
    };
}