/* TRADE fields:
   give   { materialName: amount } taken from the player
   get    { goldcoin: n } and/or { materials: { materialName: amount } } given back
   Rates are fixed and the stall is always open — no daily limit, no RNG.
   This is the "dump excess common mats for goldcoin or rarer mats" role.
*/

export const TRADE_OFFERS = [
  { key:'trade_pelt_goldcoin', give:{'Boar Pelt':2}, get:{ goldcoin:12 } },
  { key:'trade_bone_goldcoin', give:{'Large Bone':2}, get:{ goldcoin:12 } },
  { key:'trade_scale_goldcoin', give:{'Wyrm Scale':2}, get:{ goldcoin:18 } },
  { key:'trade_bearpelt_goldcoin', give:{'Bear Pelt':2}, get:{ goldcoin:16 } },

  { key:'trade_hide_pearl', give:{'Wyrm Hide':2}, get:{ materials:{'Sand Pearl':1} } },
  { key:'trade_fang_eye', give:{'Wyrm Fang':3}, get:{ materials:{'Wyrm Eye':1} } },
  { key:'trade_claw_heart', give:{'Bear Claw':3}, get:{ materials:{'Bear Heart':1} } }
];
