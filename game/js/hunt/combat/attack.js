import { hunt, player } from "../../state.js";
import { COMBAT } from "./constants.js";
import { calculateAttack } from "./damage.js";
import { spendStamina, findMonsterPart } from "./helpers.js";
import { logMsg } from "../log.js";
import { endHunt } from "../setup.js";

export function doPlayerAttack(partKey) {
  if (!spendStamina(player, COMBAT.ATTACK_STAMINA_COST)) {
    logMsg(
      "You're too winded to swing hard. Wait for stamina to recover.",
      "l-sys",
    );
    return;
  }

  const monster = hunt.monster;
  const part = findMonsterPart(monster, partKey);

  const attack = calculateAttack(part);

  applyAttack(monster, part, attack);
}

function applyAttack(monster, part, attack) {
  const wasBroken = part.broken;

  applyDamage(part, attack.damage);

  if (!(part.broken && part.postBreakImmune)) {
    applyDamage(monster, attack.damage);
  }

  logAttack(part, attack);

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

  logMsg(`${part.breakMsg} (+${part.breakBonus} bonus damage)`, "l-break");
}

function updateMonsterState(monster) {
  if (!monster.enraged && monster.hp <= monster.maxHp * 0.3) {
    monster.enraged = true;

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

function logAttack(part, attack) {
  const critText = attack.crit ? " A solid hit!" : "";

  const specialText = attack.special.note ? ` ${attack.special.note}` : "";

  logMsg(
    `You strike the ${part.name.toLowerCase()} for ${attack.damage} damage.${critText}${specialText}`,
    attack.crit ? "l-crit" : "l-hit",
  );
}
