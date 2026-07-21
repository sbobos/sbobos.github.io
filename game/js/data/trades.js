/* TRADE fields:
   give   { materialName: amount } taken from the player
   get    { zenny: n } and/or { materials: { materialName: amount } } given back
   Rates are fixed and the stall is always open — no daily limit, no RNG.
   This is the "dump excess common mats for zenny or rarer mats" role.
*/

export const TRADE_OFFERS = [
  { key:'trade_pelt_zenny', give:{'Boar Pelt':2}, get:{ zenny:12 } },
  { key:'trade_bone_zenny', give:{'Large Bone':2}, get:{ zenny:12 } },
  { key:'trade_scale_zenny', give:{'Wyrm Scale':2}, get:{ zenny:18 } },
  { key:'trade_bearpelt_zenny', give:{'Bear Pelt':2}, get:{ zenny:16 } },

  { key:'trade_hide_pearl', give:{'Wyrm Hide':2}, get:{ materials:{'Sand Pearl':1} } },
  { key:'trade_fang_eye', give:{'Wyrm Fang':3}, get:{ materials:{'Wyrm Eye':1} } },
  { key:'trade_claw_heart', give:{'Bear Claw':3}, get:{ materials:{'Bear Heart':1} } }
];
