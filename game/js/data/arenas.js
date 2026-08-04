export const ARENAS = {
  dunes: {
    key: "dunes",

    name: "The Duneback Wastes",

    desc: "Wind-carved dunes stretch to the horizon.",

    theme: {
      accent: "#7a5a2a",
      from: "#3a2c14",
      to: "#7a5a2a",
      border: "rgba(122, 90, 42, 0.5)",
    },

    hazard: {
      key: "sandstorm",

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
      accent: "#3a6a78",
      from: "#0f2a30",
      to: "#3a6a78",
      border: "rgba(111, 155, 176, 0.5)",
    },

    hazard: {
      key: "icefall",

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

export function getArenaTheme(arenaKey, arenaName = "") {
  const search = (arenaKey || arenaName).toLowerCase();

  // Find arena by matching key or checking if name includes search string
  const arena = ARENAS[search] || Object.values(ARENAS).find(
    (a) => a.key.toLowerCase() === search || a.name.toLowerCase().includes(search)
  );

  if (arena?.theme) {
    return arena.theme;
  }

  // Default fallback
  return {
    accent: "var(--gold)",
    from: "var(--gold-glow)",
    to: "var(--panel-alt)",
    border: "var(--border)",
  };
}