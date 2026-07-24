export const STORY_MISSIONS = [
  {
    key: "intro_boar",
    chapter: 1,

    title: "The Dune Track",

    description: "Investigate the boar that has been attacking caravans.",

    monsterId: "boar",

    rank: "normal",

    expedition: [
      "herb_patch",
      "small_boar",
      "iron_mine",
      { node: "boss_encounter", monsters: ["boar"] }
    ],
  },

  {
    key: "wyrm_salt",
    chapter: 2,

    title: "The Sand-Scored Trail",

    description: "Follow the strange trail disappearing beneath the dunes.",

    monsterId: "wyrm",

    rank: "normal",

    expedition: [{ node: "boss_encounter", monsters: ["wyrm"] }],
  },

  {
    key: "bear_ice",
    chapter: 3,

    title: "The Hollow Below",

    description: "Something huge is roaming the frozen valley.",

    monsterId: "bear",

    rank: "normal",

    expedition: [{ node: "boss_encounter", monsters: ["bear"] }],
  },
];
