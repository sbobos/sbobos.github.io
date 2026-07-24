export const LOOT_TABLES = {
  mining: {
    dunes: [
      { item: "Iron Ore", weight: 50 },
      { item: "Earth Crystal", weight: 30 },
      { item: "Fire Stone", weight: 15 },
      { item: "Rare Gem", weight: 5 },
    ],

    tundra: [
      { item: "Iron Ore", weight: 30 },
      { item: "Ice Crystal", weight: 45 },
      { item: "Frozen Ore", weight: 20 },
      { item: "Iceium", weight: 5 },
    ],
  },

  foraging: {
    dunes: [
      { item: "Herb", weight: 50 },
      { item: "Honey", weight: 30 },
      { item: "Cactus Fruit", weight: 20 },
    ],

    tundra: [
      { item: "Snow Herb", weight: 60 },
      { item: "Honey", weight: 20 },
      { item: "Frost Flower", weight: 20 },
    ],
  },

  fishing: {
    tundra: [
      { item: "Icefish", weight: 60 },
      { item: "Sushifish", weight: 30 },
      { item: "Golden Fish", weight: 10 },
    ],
  },

  carving: {
    boar: {
      normal: [
        { item: "Large Skull", weight: 30 },
        { item: "Boar Pelt", weight: 40 },
        { item: "Large Bone", weight: 20 },
        { item: "Beast Stone", weight: 10 },
      ],

      elite: [
        { item: "Boar Pelt+", weight: 35 },
        { item: "Boar Tusk+", weight: 30 },
        { item: "Large Bone+", weight: 20 },
        { item: "Ancient Tusk", weight: 15 },
      ],

      master: [
        { item: "Royal Pelt", weight: 30 },
        { item: "Ancient Tusk", weight: 30 },
        { item: "Boar Gem", weight: 25 },
        { item: "Ancient Bone", weight: 15 },
      ],
    },

    wyrm: {
      normal: [
        { item: "Wyrm Scale", weight: 40 },
        { item: "Wyrm Fang", weight: 25 },
        { item: "Wyrm Claw", weight: 20 },
        { item: "Dragon Bone", weight: 10 },
        { item: "Wyrm Gem", weight: 5 },
      ],

      elite: [],

      master: [],
    },

    bear: {
      normal: [
        { item: "Bear Fur", weight: 40 },
        { item: "Bear Claw", weight: 25 },
        { item: "Bear Fat", weight: 20 },
        { item: "Large Bone", weight: 10 },
        { item: "Bear Gem", weight: 5 },
      ],

      elite: [],

      master: [],
    },

    smallMonster: {
      boarling: [
        { item: "Boar Hide", weight: 70 },
        { item: "Boar Meat", weight: 30 },
      ],

      sandjackal: [
        { item: "Jackal Pelt", weight: 60 },
        { item: "Sharp Fang", weight: 40 },
      ],

      icewolf: [
        { item: "Wolf Pelt", weight: 60 },
        { item: "Ice Fang", weight: 40 },
      ],
    },
  },
};
