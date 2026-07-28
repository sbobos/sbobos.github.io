export const ARENAS = {
  dunes: {
    key: "dunes",

    name: "The Duneback Wastes",

    desc: "Wind-carved dunes stretch to the horizon.",

    theme: {
      from: "#3a2c14", // deep sand-shadow
      to: "#7a5a2a", // warm dune gold
    },

    hazard: {
      key: "sandstorm",

      every: 3,

      warnText: "The wind begins picking up.",

      triggerText: "A sandstorm sweeps across the battlefield.",
    },

    encounterPool: [
      "iron_mine",
      "herb_patch",
      "small_boar",
      "merchant",
      "lost_hunter",
      "oasis",
    ],

    lootTables: {
      mining: "mine_dunes",
      foraging: "forage_dunes",
      fishing: null,
    },
  },

  tundra: {
    key: "tundra",

    name: "Frostmaul Hollow",

    desc: "A frozen ravine covered in ancient ice.",

    theme: {
      from: "#0f2a30", // deep ice-shadow
      to: "#3a6a78", // pale frost blue
    },

    hazard: {
      key: "icefall",

      every: 4,

      warnText: "The ice ceiling begins to crack.",

      triggerText: "Massive chunks of ice fall from above.",
    },
    encounterPool: [
      "ice_mine",
      "snow_herbs",
      "small_wolf",
      "merchant",
      "hot_spring",
    ],

    lootTables: {
      mining: "mine_tundra",
      foraging: "forage_tundra",
      fishing: "fish_tundra",
    },
  },
};
