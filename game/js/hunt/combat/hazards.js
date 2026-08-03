import { hunt, player } from "../../state.js";
import { logMsg } from "../log.js";

export const HAZARDS = {
  sandstorm: {
    every: 3,
    warnText: "A harsh sandstorm is gathering...",
    execute() {
      hunt.sandstormActive = true;
      logMsg(
        "Sand whips across the arena — perfect dodges become partial dodges this turn.",
        "l-dmg"
      );
    }
  },

  icefall: {
    every: 2,
    warnText: "Ice above you is beginning to crack...",
    execute() {
      if (!hunt.playerGuardedThisRound) {
        player.hp = Math.max(0, player.hp - 8);
        logMsg("Chunks of ice crash into you for 8 damage.", "l-dmg");
      } else {
        logMsg("Your guard protects you from the falling ice.", "l-good");
      }
    }
  }
};

/**
 * Triggers arena hazards based on the turn interval
 */
export function processArenaHazard() {
  if (!hunt || hunt.over || !hunt.monster) return;

  const m = hunt.monster;
  const arenaKey = m.arenaKey;
  if (!arenaKey) return;

  // Assume ARENAS key mapping matches arenaKey
  // Import ARENAS at top of file if needed
  const hazardKey = hunt.arenaHazardKey;
  if (!hazardKey || !HAZARDS[hazardKey]) return;

  const hazard = HAZARDS[hazardKey];
  if (hunt.turnCount > 0 && hunt.turnCount % hazard.every === 0) {
    hazard.execute();
  }
}