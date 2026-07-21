/* MOVE fields:
   key            unique id
   type           'damage' (hurts the player) or 'debuff' (non-hp effect)
   telegraph      shown BEFORE the move lands (this round) — write it so the
                  wording hints which dodge direction reads correctly
   resolveText    shown WHEN the move actually lands
   dodgeType      'left' | 'right' | 'back' — the correct reaction
   blockable      can Guard reduce it? (false = must be dodged, not blocked)
   baseDamage     damage at neutral (non-enraged) power
   element        'none' | 'fire' | 'ice' — used against armor resistance
*/

export const MOVES = {
  boar_ram:       { key:'boar_ram', type:'damage', dodgeType:'left', blockable:true, baseDamage:16, element:'none',
    telegraph:"The boar lowers its tusked snout, scraping its hooves against the dirt as it locks its eyes onto you. It's preparing a full-speed charge!",
    resolveText:"The Boar surges forward like a battering ram! Its tusks spear through your guard and knock you back." },
  boar_headbut:   { key:'boar_headbut', type:'damage', dodgeType:'back', blockable:true, baseDamage:12, element:'none',
    telegraph:"The Boar pulls its heavy, armored skull back, snorting aggressively at close range.",
    resolveText:"The head whips its heavy head upward! The massive impact leaves your head ringing!" },
  boar_kick:      { key:'boar_kick', type:'damage', dodgeType:'right', blockable:false, baseDamage:10, element:'none',
    telegraph:"The Boar suddenly pivots away, bucking its hindquarters toward you while glancing back over its shoulder.",
    resolveText:"The Boar kicks out savagely with its sharp hind hooves, tearing through you!" },
  
  wyrm_bite:      { key:'wyrm_bite', type:'damage', dodgeType:'back', blockable:true, baseDamage:16, element:'none',
    telegraph:"The wyrm lowers its head and lunges its jaw forward — better to fall back than meet it head-on.",
    resolveText:"It snaps forward with a vicious bite!" },
  wyrm_tailwhip:  { key:'wyrm_tailwhip', type:'damage', dodgeType:'left', blockable:true, baseDamage:18, element:'none',
    telegraph:"Its tail curls out wide to the side, building for a sweep.",
    resolveText:"The tail whips through where you were standing!" },
  wyrm_spikeslam: { key:'wyrm_spikeslam', type:'damage', dodgeType:'right', blockable:false, baseDamage:20, element:'none',
    telegraph:"It rears up, spiked back arched — no guard will hold under this, better to step clear.",
    resolveText:"It slams its spiked back down like a hammer!" },
  wyrm_sandcharge:{ key:'wyrm_sandcharge', type:'damage', dodgeType:'right', blockable:true, baseDamage:14, element:'none',
    telegraph:"It digs its claws into the sand, coiling to rush you straight on.",
    resolveText:"It charges through the sand at full speed!" },
  wyrm_sandburst: { key:'wyrm_sandburst', type:'damage', dodgeType:'back', blockable:false, baseDamage:24, element:'fire',
    telegraph:"Its cracked belly glows from within — pressure is building fast, give it room.",
    resolveText:"The wyrm's belly erupts in a spray of superheated sand!" },

  bear_paw:       { key:'bear_paw', type:'damage', dodgeType:'left', blockable:true, baseDamage:15, element:'none',
    telegraph:"It raises a massive paw, claws catching the light.",
    resolveText:"A heavy paw swipe crashes toward you!" },
  bear_charge:    { key:'bear_charge', type:'damage', dodgeType:'right', blockable:true, baseDamage:18, element:'none',
    telegraph:"It plants its forelegs and lowers its head, ready to drive forward.",
    resolveText:"It charges in, head down!" },
  bear_slam:      { key:'bear_slam', type:'damage', dodgeType:'back', blockable:false, baseDamage:20, element:'none',
    telegraph:"Both forelegs rise together, poised to slam the ground — get clear, don't stand your ground.",
    resolveText:"It slams both forelegs down with tremendous force!" },
  bear_roar:      { key:'bear_roar', type:'debuff', dodgeType:'back', blockable:true, baseDamage:0, element:'none',
    telegraph:"It rears back on its hind legs, drawing breath for a roar.",
    resolveText:"A thunderous roar shakes the arena, rattling your nerves!" },
  bear_furybite:  { key:'bear_furybite', type:'damage', dodgeType:'left', blockable:false, baseDamage:26, element:'none',
    telegraph:"Wounded and furious, it lunges wildly with bared teeth — there is no pattern to read here, just move.",
    resolveText:"It lunges with reckless, wounded fury!" }
};
