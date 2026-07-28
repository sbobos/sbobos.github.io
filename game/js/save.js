import {
  player,
  setPlayer,
  story,
  setStory,
  world,
  setWorld,
  createDefaultPlayer,
} from "./state.js";

export const SAVE_TAG = "IRONVEIL1";

export function generateSaveCode() {
  try {
    const payload = JSON.stringify({ player, story, world });
    return SAVE_TAG + ":" + btoa(encodeURIComponent(payload));
  } catch (e) {
    return "";
  }
}

/**
 * Fills in any field missing from an old save with the current default
 * shape, without clobbering anything the save already has. Nested objects
 * (armorSlots, materials, stats, trophies, customWeapons) merge key-by-key
 * so a save missing only `arms`/`waist`/`legs` doesn't lose head/chest.
 */
function applyPlayerDefaults(loaded) {
  const def = createDefaultPlayer();
  const merged = { ...def, ...loaded };
  if (loaded.zenny != null && merged.goldcoin == null) {
    merged.goldcoin = loaded.zenny;
  }

  merged.armorSlots = { ...def.armorSlots, ...(loaded.armorSlots || {}) };
  // very old saves used a 2-slot { head, body } shape — body maps to chest
  if (loaded.armorSlots?.body && !loaded.armorSlots?.chest) {
    merged.armorSlots.chest = loaded.armorSlots.body;
  }

  merged.materials = { ...(loaded.materials || {}) };
  merged.stats = { ...def.stats, ...(loaded.stats || {}) };
  merged.trophies = { ...(loaded.trophies || {}) };
  merged.weapon = def.weapon;
  merged.customWeapons = {};
  merged.weapon = loaded.weapon ?? def.weapon;
  merged.customWeapons = { ...(loaded.customWeapons || {}) };
  merged.ownedWeapons = loaded.ownedWeapons || def.ownedWeapons;

  if (!merged.ownedArmors.includes(merged.armorSlots.chest))
    merged.ownedArmors.push(merged.armorSlots.chest);
  if (
    merged.armorSlots.head &&
    !merged.ownedArmors.includes(merged.armorSlots.head)
  )
    merged.ownedArmors.push(merged.armorSlots.head);

  return merged;
}

export function loadSaveCode(code) {
  try {
    code = (code || "").trim();
    if (!code.startsWith(SAVE_TAG + ":")) throw new Error("bad tag");
    const payload = decodeURIComponent(atob(code.slice(SAVE_TAG.length + 1)));
    const parsed = JSON.parse(payload);

    let loaded,
      loadedStory = null,
      loadedWorld = null;
    if (parsed && parsed.player && parsed.player.materials) {
      loaded = parsed.player;
      loadedStory = parsed.story || null;
      loadedWorld = parsed.world || null;
    } else {
      loaded = parsed;
    }

    if (!loaded || typeof loaded !== "object" || !loaded.materials)
      throw new Error("bad shape");

    setPlayer(applyPlayerDefaults(loaded));

    if (loadedStory && typeof loadedStory === "object") {
      setStory(loadedStory);
    }
    setWorld(
      loadedWorld && typeof loadedWorld === "object" ? loadedWorld : { day: 1 },
    );

    return true;
  } catch (e) {
    return false;
  }
}
