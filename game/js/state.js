/* ---------- SHARED MUTABLE STATE ----------
   player / story / hunt are re-assigned wholesale in a few places (new game,
   load save, starting a hunt), so they're exposed as live-binding exports
   plus setters. Any module that does `import { player } from './state.js'`
   always sees the current object — including after setPlayer() is called
   from a different module — because ES module bindings are live.
*/

export let player = {
  name:'Hunter',
  maxHp:120, hp:120,
  maxStamina:100, stamina:100,
  staggered: false,
  weapon:'basic',
  armorSlots:{ head:'headband', body:'basic' },
  ownedWeapons:['basic'],
  ownedArmors:['basic','headband'],
  zenny:60,
  potions:3,
  materials:{},
  stats:{ hunts:0, victories:0, fled:0, defeats:0 },
  trophies:{}
};

export let story = {
  chapter:1,
  activeMissionKey:'intro_boar',
  completedMissionKeys:[],
  unlockedMissionKeys:['intro_boar']
};

export let hunt = null;

export function setPlayer(p){ player = p; }
export function setStory(s){ story = s; }
export function setHunt(h){ hunt = h; }
