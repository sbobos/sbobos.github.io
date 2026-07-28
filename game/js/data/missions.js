export const MISSIONS = [
  {
    key: "intro_boar",

    category: "main",
    chapter: 1,
    unlockChapter: 1,

    title: "The Dune Track",
    description: "Investigate the boar attacking caravans.",

    monsterId: "boar",
    rank: "normal",
    stars: 1,

    client: "Caravan Master Ressa",

    expedition: [
      "herb_patch",
      "small_boar",
      "iron_mine",
      { node: "boss_encounter", monsters: ["boar"] },
    ],

    rewards: {
      goldcoin: 0,
      unlocksChapter: 2,
    },
  },
  {
    key: "side_double_boar",

    category: "side",
    unlockChapter: 2,

    title: "Boar Cull",
    description: "The Guild requests that two boars be eliminated.",

    monsterId: "boar",
    rank: "normal",
    stars: 2,

    client: "Guild Liaison Tobrin",

    expedition: [
      { node: "random_fill", arena: "dunes", min: 1, max: 2 },
      { node: "boss_encounter", monsters: ["boar"] },
      { node: "random_fill", arena: "dunes", min: 1, max: 2 },
      { node: "boss_encounter", monsters: ["boar"] },
    ],

    rewards: {
      goldcoin: 300,
    },
  },
  {
    key: "side_boar_expedition",

    category: "side",
    unlockChapter: 2,

    title: "Boar Expedition",
    description: "The Guild requests that boar be eliminated.",

    monsterId: "boar",
    rank: "normal",
    stars: 2,

    client: "Guild Liaison Tobrin",

    expedition: [
      { node: "random_fill", arena: "dunes", min: 2, max: 4 },
      { node: "boss_encounter", monsters: ["boar"] },
    ],

    rewards: {
      goldcoin: 300,
    },
  },
  {
    key: "wyrm_salt",

    category: "main",
    chapter: 2,
    unlockChapter: 2,

    title: "The Sand-Scored Trail",
    description: "Follow the strange trail disappearing beneath the dunes.",

    monsterId: "wyrm",
    rank: "normal",
    stars: 3,

    client: "Investigator Halewyn",

    expedition: [
      "herb_patch",
      "small_boar",
      "iron_mine",
      { node: "boss_encounter", monsters: ["wyrm"] },
    ],

    rewards: {
      goldcoin: 0,
      unlocksChapter: 3,
    },
  },
  {
    key: "side_wyrm_boar_expedition",

    category: "side",
    unlockChapter: 3,

    title: "Dune Expedition",
    description: "The Guild requests that two dune creatures be eliminated.",

    monsterId: "wyrm",
    rank: "normal",
    stars: 3,

    client: "Guild Liaison Tobrin",

    expedition: [
      { node: "random_fill", arena: "dunes", min: 1, max: 3 },
      { node: "boss_encounter", monsters: ["boar"] },
      { node: "random_fill", arena: "dunes", min: 1, max: 3 },
      { node: "boss_encounter", monsters: ["wyrm"] },
    ],

    rewards: {
      goldcoin: 300,
    },
  },
  {
    key: "bear_ice",

    category: "main",
    chapter: 3,
    unlockChapter: 3,

    title: "The Hollow Below",
    description: "Something huge is roaming the frozen valley.",

    monsterId: "bear",
    rank: "normal",
    stars: 4,

    client: "Investigator Halewyn",
    timeLimit: 50,
    conditions: ["HR 7 or higher", "Solo"],
    failureConditions: ["Time expires", "Faint 3 times"],

    expedition: [
      "herb_patch",
      "small_boar",
      "iron_mine",
      { node: "boss_encounter", monsters: ["bear"] },
    ],

    rewards: {
      goldcoin: 0,
      unlocksChapter: 4,
    },
  },
];
