import { hunt, player } from "../state.js";

import { doPlayerAttack } from "./combat/attack.js";
import { currentWeapon } from "../utils.js";

import { logMsg } from "./log.js";
import { resolvePendingMove } from "./resolve.js";
import { monsterTelegraphPhase } from "./telegraph.js";
import { endHunt } from "./setup.js";

import { renderHunt } from "../ui/hunt.js";

export function playerAction(actionType, payload = {}) {
  if (hunt.over) {
    return;
  }

  if (player.staggered) {
    handleStagger();
    return;
  }

  hunt.playerGuardedThisRound = actionType === "guard";

  if (actionType === "flee") {
    handleFlee();
    return;
  }

  if (hunt.pendingMove) {
    if (handleReaction(actionType, payload)) {
      return;
    }
  }

  performAction(actionType, payload);

  if (combatFinished()) {
    return;
  }

  nextMonsterTurn();
}

function handleStagger() {
  player.staggered = false;

  logMsg("You're staggered and lose your footing!", "l-dmg");

  nextMonsterTurn();
}

// actions.js
function handleReaction(actionType, payload) {
  if (actionType === "attack") {
    logMsg(
      "You commit to the attack, trading blows as the monster's strike lands!",
      "l-sys",
    );

    doPlayerAttack(payload.partKey, payload.moveKey);

    if (combatFinished()) {
      return true;
    }

    resolvePendingMove("attack", payload);

    hunt.recoveryWindow = true;

    renderHunt();

    return true;
  }

  if (actionType !== "guard" && actionType !== "dodge") {
    logMsg(
      "The monster is already committing to its attack — react now!",
      "l-sys",
    );

    renderHunt();

    return true;
  }

  resolvePendingMove(actionType, payload);
  renderHunt();

  return true;
}

function performAction(actionType, payload) {
  switch (actionType) {
    case "attack":
      attack(payload.partKey, payload.moveKey);
      break;

    case "guard":
      guard();
      break;

    case "dodge":
      dodge();
      break;

    case "item":
      usePotion();
      break;
  }
}

function attack(partKey, moveKey) {
  doPlayerAttack(partKey, moveKey);

  if (hunt.over) {
    return;
  }

  if (!hunt.recoveryWindow) {
    hunt.recoveryWindow = true;

    logMsg(
      "The monster recoils from the hit, giving you a brief opening.",
      "l-good",
    );
  } else {
    logMsg(
      "You keep the pressure on while the monster is still off-balance.",
      "l-good",
    );
  }

  renderHunt();
}

function guard() {
  const weapon = currentWeapon();

  recoverStamina(Math.round(20 * (weapon.guardStaminaMult ?? 1)));

  if (!hunt.pendingMove) {
    logMsg("You settle into a ready stance, catching your breath.", "l-sys");
  }
}

function dodge() {
  if (hunt.pendingMoveWasJustResolved) {
    return;
  }

  recoverStamina(10);

  logMsg("You reposition, staying light on your feet.", "l-sys");
}

function usePotion() {
  if (player.potions <= 0) {
    logMsg("No potions left in your pack.", "l-sys");

    return;
  }

  player.potions--;

  player.hp = Math.min(player.maxHp, player.hp + 40);

  logMsg("You down a potion, recovering 40 HP.", "l-sys");
}

function recoverStamina(amount) {
  player.stamina = Math.min(player.maxStamina, player.stamina + amount);
}

function handleFlee() {
  if (Math.random() < 0.75) {
    logMsg("You break away and retreat from the hunting grounds.", "l-sys");

    hunt.pendingMove = null;

    endHunt("flee");

    return;
  }

  logMsg("You can't find an opening to escape!", "l-sys");

  if (hunt.pendingMove) {
    resolvePendingMove("flee_fail", {});

    if (combatFinished()) {
      return;
    }
  }

  nextMonsterTurn();
}

function nextMonsterTurn() {
  hunt.pendingMoveWasJustResolved = false;

  hunt.recoveryWindow = false;

  monsterTelegraphPhase();

  renderHunt();

  hunt.playerGuardedThisRound = false;
}

function combatFinished() {
  if (hunt.over) {
    return true;
  }

  if (player.hp <= 0) {
    endHunt("defeat");

    return true;
  }

  return false;
}
