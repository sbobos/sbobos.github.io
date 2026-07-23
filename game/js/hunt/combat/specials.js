import { chance } from "./helpers.js";

const specials = {

    boarhammer(part) {

        if (!part.broken) {
            return {
                extraDamage: 0,
                note: ""
            };
        }

        return {
            extraDamage: 4,
            note:
                "Impact drives extra force into the exposed wound."
        };
    },

    wyrmfang(part, damage, crit) {

        if (!crit && part.hitzone.fire < 20) {
            return {
                extraDamage: 0,
                note: ""
            };
        }

        return {
            extraDamage: 6,
            note:
                "The blade sears the weak spot with blazing force."
        };
    },

    dunelord() {

        if (!chance(0.2)) {
            return {
                extraDamage: 0,
                note: ""
            };
        }

        return {
            extraDamage: 8,
            note:
                "The greatfang overwhelms the target with a crushing blow."
        };
    }

};

export function getWeaponSpecialEffect(
    weapon,
    part,
    damage,
    crit
) {

    const special = specials[weapon.key];

    if (!special) {
        return {
            extraDamage: 0,
            note: ""
        };
    }

    return special(
        part,
        damage,
        crit
    );
}