import { hunt, player } from "../../state.js";
import { calculateAttack } from "./damage.js";
import { spendStamina, findMonsterPart } from "./helpers.js";
import { logMsg } from "../log.js";
import { endHunt } from "../setup.js";
import { currentWeapon, playSound, triggerShake } from "../../utils.js"; // <-- Updated Imports
import { movesetFor } from "../../data/playermoves.js";

export function doPlayerAttack(partKey, moveKey) {
  const weapon = currentWeapon();
  const moveset = movesetFor(weapon);
  const move =
    moveset.moves.find((mv) => mv.key === moveKey) ?? moveset.moves[0];

  const staminaCost = Math.round(move.staminaCost * (weapon.staminaMult ?? 1));

  if (!spendStamina(player, staminaCost)) {
    logMsg(
      "You're too winded to swing hard. Wait for stamina to recover.",
      "l-sys",
    );
    return;
  }

  const monster = hunt.monster;
  const part = findMonsterPart(monster, partKey);

  const attack = calculateAttack(part, move);

  // Trigger base attack audio and light shake
  playSound(attack.crit ? "crit" : "slash");
  triggerShake("hunt-screen");

  applyAttack(monster, part, attack, move);
}

function applyAttack(monster, part, attack, move) {
  const wasBroken = part.broken;

  applyDamage(part, attack.damage);

  if (!(part.broken && part.postBreakImmune)) {
    applyDamage(monster, attack.damage);
  }

  logAttack(part, attack, move);

  if (part.hp <= 0 && !wasBroken) {
    breakPart(monster, part);
  }

  updateMonsterState(monster);
}

function applyDamage(target, amount) {
  target.hp = Math.max(0, target.hp - amount);
}

function breakPart(monster, part) {
  part.broken = true;

  applyDamage(monster, part.breakBonus);

  // Break FX
  playSound("break");
  triggerShake("hunt-screen");

  logMsg(`${part.breakMsg} (+${part.breakBonus} bonus damage)`, "l-break");
}

function updateMonsterState(monster) {
  if (!monster.enraged && monster.hp <= monster.maxHp * 0.3) {
    monster.enraged = true;

    // Enrage FX
    playSound("enrage");

    logMsg(
      `The ${monster.name} is enraged! Its attacks grow fiercer.`,
      "l-dmg",
    );
  }

  if (monster.hp <= 0) {
    logMsg(`The ${monster.name} collapses. The hunt is over.`, "l-break");

    endHunt("victory");
  }
}

function logAttack(part, attack, move) {
  const critText = attack.crit ? " A solid hit!" : "";
  const specialText = attack.special.note ? ` ${attack.special.note}` : "";

  logMsg(
    `You use ${move.name} on the ${part.name.toLowerCase()} for ${attack.damage} damage.${critText}${specialText}`,
    attack.crit ? "l-crit" : "l-hit",
  );
}
