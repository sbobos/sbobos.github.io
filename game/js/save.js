import { player, setPlayer, story, setStory } from './state.js';

/* ---------- SAVE / LOAD (portable code, no browser storage) ---------- */

export const SAVE_TAG = 'IRONVEIL1';

export function generateSaveCode(){
  try{
    const payload = JSON.stringify({ player, story });
    return SAVE_TAG + ':' + btoa(encodeURIComponent(payload));
  } catch(e){
    return '';
  }
}

export function loadSaveCode(code){
  try{
    code = (code||'').trim();
    if (!code.startsWith(SAVE_TAG+':')) throw new Error('bad tag');
    const payload = decodeURIComponent(atob(code.slice(SAVE_TAG.length+1)));
    const parsed = JSON.parse(payload);

    // New saves are { player, story }. Old saves are the bare player object
    // itself — detect by checking for a materials field where we'd expect one.
    let loaded, loadedStory = null;
    if (parsed && parsed.player && parsed.player.materials){
      loaded = parsed.player;
      loadedStory = parsed.story || null;
    } else {
      loaded = parsed;
    }

    if (!loaded || typeof loaded !== 'object' || !loaded.materials) throw new Error('bad shape');
    loaded.stats = loaded.stats || { hunts:0, victories:0, fled:0, defeats:0 };
    loaded.trophies = loaded.trophies || {};
    loaded.ownedWeapons = loaded.ownedWeapons || ['basic'];
    loaded.ownedArmors = loaded.ownedArmors || ['basic'];
    loaded.armorSlots = loaded.armorSlots || { head:'headband', body:'basic' };
    if (!loaded.armorSlots.head) loaded.armorSlots.head = 'headband';
    if (!loaded.armorSlots.body) loaded.armorSlots.body = 'basic';
    if (!loaded.ownedWeapons.includes(loaded.weapon)) loaded.ownedWeapons.push(loaded.weapon);
    if (!loaded.ownedArmors.includes(loaded.armorSlots.body)) loaded.ownedArmors.push(loaded.armorSlots.body);
    if (!loaded.ownedArmors.includes(loaded.armorSlots.head)) loaded.ownedArmors.push(loaded.armorSlots.head);
    setPlayer(loaded);

    if (loadedStory && typeof loadedStory === 'object'){
      setStory(loadedStory);
    }
    // old-format saves have no story data — story just stays at whatever
    // the current session default is, same as before this patch

    return true;
  } catch(e){
    return false;
  }
}
