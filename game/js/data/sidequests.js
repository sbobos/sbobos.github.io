export const SIDE_MISSIONS = [
  {
    key: "side_jackal_trouble",
    title: "Jackal Trouble",
    monsterId: "wyrm",
    unlockChapter: 1,
    rank: "normal",
    expedition: [
      "iron_mine",
      { node: "boss_encounter", monsters: ["wyrm"] },
    ],
  },
  {
  key: "side_boar_expedition",
  title: "Boar Expedition",
  monsterId: "boar",
  unlockChapter: 1,
  rank: "normal",
  expedition: [
    { node: "random_fill", arena: "dunes", min: 1, max: 3 },
    { node: "boss_encounter", monsters: ["boar"] },
  ],
},
];