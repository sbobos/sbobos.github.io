import { hunt, player } from "../../state.js";
import { logMsg } from "../log.js";

export const HAZARDS = {
  sandstorm() {
    hunt.sandstormActive = true;

    logMsg(
      "Sand whips across the arena — perfect dodges become partial dodges this turn.",
      "l-dmg",
    );
  },

  icefall() {
    if (!hunt.playerGuardedThisRound) {
      player.hp = Math.max(0, player.hp - 8);

      logMsg("Chunks of ice crash into you for 8 damage.", "l-dmg");
    } else {
      logMsg("Your guard protects you from the falling ice.", "l-good");
    }
  },
};
