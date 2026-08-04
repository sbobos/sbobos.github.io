import { hunt, player } from "../state.js";
import { isPartBroken } from "./parts.js";
import { logMsg } from "./log.js";
import { getArmorStats } from "../utils.js";

export function resolvePendingMove(actionType, payload = {}) {
  const move = hunt.pendingMove;
  const m = hunt.monster;

  if (isPartBroken(m, "head") && Math.random() < 0.15) {
    logMsg(
      "Dazed from its wound, the attack fizzles before it lands!",
      "l-good"
    );
    hunt.pendingMove = null;
    return;
  }

  let outcome;
  if (actionType === "dodge") {
    const correctDir = payload.dir === move.dodgeType;
    const timing = payload.timingQuality || "PERFECT";

    if (correctDir && timing === "PERFECT") {
      outcome = hunt.sandstormActive ? "partial" : "perfect";
    } else if (correctDir && timing === "EARLY") {
      outcome = "partial";
      logMsg("You dodged early! The blow glances off you.", "l-sys");
    } else if (!correctDir) {
      outcome = "full";
      logMsg("You dodged the wrong way!", "l-dmg");
    } else {
      outcome = "full";
      logMsg("Mistimed dodge!", "l-dmg");
    }
  } else if (actionType === "guard") {
    switch (move.guardResult) {
      case "block":
        outcome = "blocked";
        break;

      case "stagger":
        player.staggered = true;
        if (move.staminaBreak) player.stamina = 0;
        logMsg("Your guard is shattered by the impact!", "l-dmg");
        outcome = "guardFail";
        break;

      case "pierce":
      case "ignore":
        if (move.staminaBreak) player.stamina = 0;
        logMsg("The attack pierces straight through your guard!", "l-dmg");
        outcome = "full";
        break;

      default:
        outcome = "blocked";
    }
  } else if (actionType === "attack") {
    // 💥 OFFSET MECHANIC: Perfect timing gives 65% damage reduction!
    outcome = payload.timingQuality === "PERFECT" ? "offset" : "full";
  } else {
    outcome = "full";
  }

  const dmgMult = {
    perfect: 0,
    partial: 0.5,
    blocked: 0.35,
    offset: 0.35, // Reduced damage taken when successfully offsetting the monster!
    guardFail: 1,
    full: 1,
  }[outcome];

  if (move.type === "debuff") {
    const staminaLoss = Math.round(20 * dmgMult);
    player.stamina = Math.max(0, player.stamina - staminaLoss);
    if (outcome === "perfect")
      logMsg("You brace through the roar, unshaken.", "l-good");
    else
      logMsg(`${move.resolveText} You lose ${staminaLoss} stamina.`, "l-dmg");
  } else {
    let dmg = Math.round(
      move.baseDamage *
      (m.enraged ? 1.25 : 1) *
      (isPartBroken(m, "tail") ? 0.9 : 1) *
      (m.damageMult ?? 1) *
      dmgMult
    );

    if (move.element !== "none") {
      const armorStats = getArmorStats();
      const resist = armorStats.resist[move.element] || 0;
      dmg = Math.round(dmg * (1 - resist / 100));
    }

    if (dmg > 0) {
      const armorStats = getArmorStats();
      dmg = Math.max(1, dmg - Math.round(armorStats.def * 0.5));
      player.hp = Math.max(0, player.hp - dmg);
    }

    if (outcome === "perfect")
      logMsg(
        `${move.resolveText} You read it perfectly and dodge clean.`,
        "l-good"
      );
    else if (outcome === "offset")
      logMsg(
        `Your counter-strike partially deflects the incoming blow! You take ${dmg} damage.`,
        "l-good"
      );
    else if (outcome === "guardFail")
      logMsg(
        `${move.resolveText} Your guard does nothing against this — you take ${dmg} damage.`,
        "l-dmg"
      );
    else if (dmg > 0)
      logMsg(`${move.resolveText} You take ${dmg} damage.`, "l-dmg");
    else logMsg(`${move.resolveText} You avoid it entirely.`, "l-good");
  }

  hunt.pendingMove = null;
  hunt.sandstormActive = false;
  hunt.pendingMoveWasJustResolved = true;
}