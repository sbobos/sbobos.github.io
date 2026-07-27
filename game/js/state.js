/* ---------- SHARED MUTABLE STATE ----------
   player / story / hunt are re-assigned wholesale in a few places (new game,
   load save, starting a hunt), so they're exposed as live-binding exports
   plus setters. Any module that does `import { player } from './state.js'`
   always sees the current object — including after setPlayer() is called
   from a different module — because ES module bindings are live.
*/

export function createDefaultPlayer() {
  return {
    name: "sbobs",
    maxHp: 120,
    hp: 120,
    maxStamina: 100,
    stamina: 100,
    staggered: false,
    weapon: "basic",
    armorSlots: {
      head: "headband",
      chest: "basic",
      arms: null,
      waist: null,
      legs: null,
    },
    ownedWeapons: ["basic"],
    ownedArmors: ["basic", "headband"],
    customWeapons: {},
    goldcoin: 60,
    potions: 3,
    materials: {},
    forgeLevel: 0,
    stats: { hunts: 0, victories: 0, fled: 0, defeats: 0 },
    trophies: {},
  };
}

export let player = createDefaultPlayer();

export let story = {
  chapter: 1,
  activeMissionKey: "intro_boar",
  completedMissionKeys: [],
  unlockedMissionKeys: ["intro_boar"],
};

export let hunt = null;

export let world = {
  day: 1,
  // future home for: weather, dailyShopSeed, activeEvents, etc.
};

export function setPlayer(p) {
  player = p;
}
export function setStory(s) {
  story = s;
}
export function setHunt(h) {
  hunt = h;
}
export function setWorld(w) {
  world = w;
}
