import { hunt } from '../state.js';
import { logMsg } from '../hunt/log.js';
import { player } from '../state.js';

/* Arena hazards fire on a timer: one round of warning, then the effect. */
export const ARENAS = {
  dunes: {
    key:'dunes', name:'The Duneback Wastes',
    desc:'Wind-carved dunes stretch to the horizon, heat shimmering off the sand.',
    hazard:{ every:4,
      warnText:"The wind is rising — grit stings the air.",
      triggerText:"A sandstorm gust rips across the arena, blinding your footing!",
      effect(){ hunt.sandstormActive = true; } }
  },
  tundra: {
    key:'tundra', name:'Frostmaul Hollow',
    desc:'A frozen ravine choked with old ice falls and groaning glaciers.',
    hazard:{ every:5,
      warnText:"Ice creaks somewhere overhead — something's coming loose.",
      triggerText:"Chunks of ice crash down across the arena!",
      effect(){
        if (!hunt.playerGuardedThisRound){
          player.hp = Math.max(0, player.hp - 8);
          logMsg('Falling ice clips you for 8 damage.', 'l-dmg');
        } else {
          logMsg('You shelter against your guard as ice shatters around you.', 'l-good');
        }
      } }
  }
};
