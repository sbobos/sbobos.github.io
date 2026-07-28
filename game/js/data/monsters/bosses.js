/* PART fields:
   hitzone            {cut, blunt, fire, ice} 0-100ish — how much of an
                       attack's power actually transfers on a hit to this part
   exposedMultiplier  hitzone multiplier once THIS part is broken
                       (>1 = broken part is now a real weak point, not dead weight)
   requiresBroken      key of another part that must break first, or null
                       (thick plating protecting a softer part underneath)
   lockedMultiplier    hitzone multiplier while requiresBroken is unmet
                       (>1 = broken part is now a real weak point, not dead weight)
   postBreakImmune    if true, hits here stop damaging monster.hp once broken
                        (the "one-time payload" pattern — use sparingly)
   disablesMoves      move keys removed from the pool once this part breaks
   unlocksMove        a move key added to the pool once this part breaks

   Move keys referenced here (defaultMoveKeys, disablesMoves, unlocksMove) are
   looked up by string key in MOVES at runtime — no direct import needed.

   RANK fields (optional `ranks` block, see js/data/ranks.js):
   ranks.elite / ranks.master   { hpMult, damageMult, addMoveKeys }
   hpMult/damageMult scale this monster's maxHp / outgoing move damage at
   that rank. addMoveKeys are new moves that unlock at that rank, added
   cumulatively (master keeps elite's moves too). A monster with no
   `ranks` block falls back to js/data/ranks.js DEFAULT_RANK_SCALING with
   no bonus moves — fine for WIP content, not recommended for anything
   actually fought at elite/master.

   ECOLOGY fields (timeOfDay, population):
   Flavor-only, shown on the Quest Board detail panel next to the arena
   name. Not read by any hunt/combat logic — safe to leave off a monster
   entirely (falls back to "Unknown" in the UI) if not decided yet.
*/

export const BOSSES = {
  boar: {
    id: "boar",
    name: "Ram Hog",
    icon: "🐖",
    arenaKey: "dunes",
    flavor:
      "Agile, agresive, and large sized dune hog. Hostile toward everything it faces.",
    timeOfDay: "Daytime",
    population: "Plenty",
    maxHp: 160,
    defaultMoveKeys: ["boar_ram", "boar_headbut", "boar_kick"],
    ranks: {
      elite: { hpMult: 2.4, damageMult: 1.3, addMoveKeys: ["boar_frenzy"] },
      master: { hpMult: 5.6, damageMult: 1.6, addMoveKeys: ["boar_rampage"] },
    },
    parts: [
      {
        key: "head",
        name: "Head",
        maxHp: 60,
        hitzone: { cut: 20, blunt: 60, fire: 15, ice: 5 },
        exposedMultiplier: 1.35,
        requiresBroken: null,
        postBreakImmune: false,
        breakBonus: 22,
        breakMsg: "The hardened skull shell shattered!",
        rewards: ["Boar Tusk", "Large Skull", "Large Skull"],
        disablesMoves: ["boar_ram"],
      },
      {
        key: "body",
        name: "Body",
        maxHp: 100,
        hitzone: { cut: 45, blunt: 40, fire: 10, ice: 5 },
        exposedMultiplier: 1.3,
        requiresBroken: null,
        postBreakImmune: false,
        breakBonus: 26,
        breakMsg: "Scars and wound visible!",
        rewards: ["Boar Pelt", "Boar Pelt", "Large Bone"],
        disablesMoves: [],
      },
    ],
    carveTable: {
      normal: "boar_normal",
      elite: "boar_elite",
      master: "boar_master",
    },
    goldcoinRange: [50, 100],
  },

  wyrm: {
    id: "wyrm",
    name: "Duneback Wyrm",
    icon: "🦎",
    arenaKey: "dunes",
    flavor:
      "A sand-armored wyrm that stalks the dunes at dusk. Fast, low, and vicious in a scrap.",
    timeOfDay: "Dusk",
    population: "Rare",
    maxHp: 320,
    defaultMoveKeys: [
      "wyrm_bite",
      "wyrm_tailwhip",
      "wyrm_spikeslam",
      "wyrm_sandcharge",
    ],
    ranks: {
      elite: {
        hpMult: 2.4,
        damageMult: 1.3,
        addMoveKeys: ["wyrm_burrowstrike"],
      },
      master: {
        hpMult: 5.6,
        damageMult: 1.6,
        addMoveKeys: ["wyrm_sandmaelstrom"],
      },
    },
    parts: [
      {
        key: "head",
        name: "Head",
        maxHp: 80,
        hitzone: { cut: 40, blunt: 30, fire: 15, ice: 5 },
        exposedMultiplier: 1.35,
        requiresBroken: null,
        postBreakImmune: false,
        breakBonus: 22,
        breakMsg:
          "The wyrm's jaw cracks — its bite loses its edge, and the wound stays raw and open.",
        rewards: ["Wyrm Fang", "Wyrm Fang", "Wyrm Eye"],
        disablesMoves: ["wyrm_bite"],
      },
      {
        key: "spikes",
        name: "Back Spikes",
        maxHp: 100,
        hitzone: { cut: 25, blunt: 50, fire: 10, ice: 5 },
        exposedMultiplier: 1.3,
        requiresBroken: null,
        postBreakImmune: false,
        breakBonus: 26,
        breakMsg: "Spikes shatter and rain into the sand!",
        rewards: ["Wyrm Spike", "Wyrm Spike", "Wyrm Scale"],
        disablesMoves: ["wyrm_spikeslam"],
      },
      {
        key: "tail",
        name: "Tail",
        maxHp: 70,
        hitzone: { cut: 45, blunt: 25, fire: 10, ice: 5 },
        exposedMultiplier: 1.3,
        requiresBroken: null,
        postBreakImmune: false,
        breakBonus: 16,
        breakMsg: "The tail drops — its sweeping strikes are gone for good.",
        rewards: ["Wyrm Tail", "Wyrm Scale"],
        disablesMoves: ["wyrm_tailwhip"],
      },
      {
        key: "belly",
        name: "Belly",
        maxHp: 90,
        hitzone: { cut: 55, blunt: 35, fire: 10, ice: 25 },
        exposedMultiplier: 1.2,
        requiresBroken: "spikes",
        lockedMultiplier: 0.3,
        postBreakImmune: false,
        breakBonus: 30,
        breakMsg:
          "The belly plating shatters — something glints beneath the wound!",
        rewards: ["Wyrm Core"],
        unlocksMove: "wyrm_sandburst",
      },
    ],
    carveTable: {
      normal: "wyrm_normal",
      elite: "wyrm_elite",
      master: "wyrm_master",
    },
    goldcoinRange: [90, 150],
  },
  bear: {
    id: "bear",
    name: "Frost Maul Bear",
    icon: "🐻",
    arenaKey: "tundra",
    flavor:
      "A tundra brute built like a landslide. Slow to anger, unstoppable once roused.",
    timeOfDay: "Daytime",
    population: "Scarce",
    maxHp: 300,
    defaultMoveKeys: ["bear_paw", "bear_charge", "bear_slam", "bear_roar"],
    ranks: {
      elite: { hpMult: 2.4, damageMult: 1.3, addMoveKeys: ["bear_mauling"] },
      master: { hpMult: 5.6, damageMult: 1.6, addMoveKeys: ["bear_avalanche"] },
    },
    parts: [
      {
        key: "head",
        name: "Head",
        maxHp: 90,
        hitzone: { cut: 35, blunt: 45, fire: 10, ice: 15 },
        exposedMultiplier: 1.3,
        requiresBroken: null,
        postBreakImmune: false,
        breakBonus: 24,
        breakMsg:
          "A solid hit staggers the bear — it reels, dazed, wound left raw.",
        rewards: ["Bear Fang", "Bear Fang"],
        disablesMoves: [],
      },
      {
        key: "forelegs",
        name: "Forelegs",
        maxHp: 110,
        hitzone: { cut: 30, blunt: 55, fire: 5, ice: 10 },
        exposedMultiplier: 1.3,
        requiresBroken: null,
        postBreakImmune: false,
        breakBonus: 26,
        breakMsg: "A foreleg buckles — it can no longer drive a charge.",
        rewards: ["Bear Claw", "Bear Claw", "Bear Pelt"],
        disablesMoves: ["bear_charge"],
      },
      {
        key: "hide",
        name: "Hide",
        maxHp: 90,
        hitzone: { cut: 20, blunt: 35, fire: 5, ice: 35 },
        exposedMultiplier: 1.25,
        requiresBroken: null,
        postBreakImmune: false,
        breakBonus: 18,
        breakMsg: "Thick hide splits open under the blow.",
        rewards: ["Bear Pelt", "Bear Pelt"],
        disablesMoves: [],
      },
      {
        key: "belly",
        name: "Belly",
        maxHp: 80,
        hitzone: { cut: 50, blunt: 35, fire: 5, ice: 10 },
        exposedMultiplier: 1.2,
        requiresBroken: "hide",
        lockedMultiplier: 0.3,
        postBreakImmune: true,
        breakBonus: 28,
        breakMsg:
          "The bear's guard finally breaks — a decisive wound, though little more can be gained from it.",
        rewards: ["Bear Heart"],
        unlocksMove: "bear_furybite",
      },
    ],
    carveTable: {
      normal: "bear_normal",
      elite: "bear_elite",
      master: "bear_master",
    },
    goldcoinRange: [80, 140],
  },
};
