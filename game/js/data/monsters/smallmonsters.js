// updated SMALL_MONSTERS in js/data/monsters/smallmonsters.js
export const SMALL_MONSTERS = {
  boarling: {
    id: "boarling",
    name: "Young Boar",
    icon: "🐗",
    arena: "dunes",
    hp: 35,
    maxStamina: 50,
    lootTable: "boarling",
    goldcoinRange: [5, 10],
    moveKeys: ["boarling_tackle"], // <--- Added moveKeys
  },

  sandjackal: {
    id: "sandjackal",
    name: "Sand Jackal",
    icon: "🦊",
    arena: "dunes",
    hp: 45,
    maxStamina: 50,
    lootTable: "sandjackal",
    goldcoinRange: [8, 15],
    moveKeys: ["sandjackal_nip"], // <--- Added moveKeys
  },

  icewolf: {
    id: "icewolf",
    name: "Ice Wolf",
    icon: "🐺",
    arena: "tundra",
    hp: 55,
    maxStamina: 50,
    lootTable: "icewolf",
    goldcoinRange: [10, 20],
    moveKeys: ["icewolf_pounce"], // <--- Added moveKeys
  },
};