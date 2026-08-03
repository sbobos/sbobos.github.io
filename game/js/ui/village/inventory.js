import { player } from "../../state.js";
import {
  WEAPONS,
  ARMORS,
  assembleWeapon,
  assembleFromPartKeys,
} from "../../data/gear.js";
import { renderPaperdoll } from "../shared/equipmentloadout.js";
import { renderVillage } from "../village.js";
import { iconStripDetail } from "../components/iconStripDetail.js";
import { equipCustomWeapon } from "./weaponforge.js";

/* ---------- ICON HELPERS (no icon data on items yet — type-based fallback) ---------- */
function weaponIcon(damageType) {
  const map = { slash: "🗡️", blunt: "🔨", pierce: "🔱", fire: "🔥", ice: "❄️" };
  return map[(damageType || "").toLowerCase()] || "⚔️";
}
function armorIcon(slot) {
  const map = { head: "🪖", chest: "🥋", arms: "🧤", waist: "🎗️", legs: "👢" };
  return map[slot] || "🛡️";
}

/* ---------- DATA ASSEMBLY ---------- */
function getWeaponList() {
  const owned = player.ownedWeapons.map((key) => {
    const item = assembleWeapon(key);
    return {
      key,
      name: item.name,
      atk: item.atk,
      damageType: item.damageType,
      element: item.element,
      elementPower: item.elementPower,
      equipped: player.weapon === key,
      custom: false,
    };
  });

  const custom = Object.values(player.customWeapons || {})
    .map((w) => {
      const item = assembleFromPartKeys(w);
      if (!item) return null;
      return {
        key: w.id,
        name: w.name,
        atk: item.atk,
        damageType: item.damageType,
        element: item.element,
        elementPower: item.elementPower,
        equipped: player.weapon === w.id,
        custom: true,
      };
    })
    .filter(Boolean);

  return [...owned, ...custom];
}

function getArmorList() {
  return player.ownedArmors.map((key) => {
    const item = ARMORS[key];
    return {
      key,
      name: item.name,
      slot: item.slot,
      def: item.def,
      resist: item.resist,
      equipped: player.armorSlots[item.slot] === key,
    };
  });
}

function weaponItems() {
  return getWeaponList().map((item) => ({
    key: item.key,
    icon: weaponIcon(item.damageType),
    label: item.name,

    ready: item.equipped,

    tag: item.damageType,

    desc:
      `Attack: ${item.atk}` +
      (item.element !== "none"
        ? `\n${item.element} +${item.elementPower}`
        : ""),

    cost: item.equipped ? "Equipped" : "Stored",

    actionLabel: item.equipped ? "Equipped" : "Equip",

    disabled: item.equipped,

    onAction() {
      if (item.custom) {
        equipCustomWeapon(item.key);
      } else {
        equipOwnedItem(item.key, true);
      }

      return true;
    },
  }));
}

const weaponTab = iconStripDetail({
  items: weaponItems,
});

function armorItems() {
  return getArmorList().map((item) => {
    let desc = `Defense: ${item.def}`;

    const resist = Object.entries(item.resist || {})
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k} +${v}%`)
      .join(" · ");

    if (resist) {
      desc += `\n${resist}`;
    }

    return {
      key: item.key,
      icon: armorIcon(item.slot),
      label: item.name,

      ready: item.equipped,

      tag: item.slot,

      desc,

      cost: item.equipped ? "Equipped" : "Stored",

      actionLabel: item.equipped ? "Equipped" : "Equip",

      disabled: item.equipped,

      onAction() {
        equipOwnedItem(item.key, false);
        return true;
      },
    };
  });
}

const armorTab = iconStripDetail({
  items: armorItems,
});

function materialItems() {
  return Object.entries(player.materials)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({
      key: name,
      icon: "📦",
      label: name,

      ready: false,

      tag: "Material",

      desc: `Owned: ${count}`,

      cost: "",

      actionLabel: "",

      disabled: true,

      onAction() {
        return false;
      },
    }));
}

const materialTab = iconStripDetail({
  items: materialItems,
});

function trophyItems() {
  return Object.entries(player.trophies)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({
      key: name,
      icon: "🏆",
      label: name,

      ready: false,

      tag: "Trophy",

      desc: `Owned: ${count}`,

      cost: "",

      actionLabel: "",

      disabled: true,

      onAction() {
        return false;
      },
    }));
}

const trophyTab = iconStripDetail({
  items: trophyItems,
});

export function buildInventoryTabs() {
  return [
    {
      key: "weapons",
      label: "Weapons",
      render: weaponTab.render,
      onAction: weaponTab.onAction,
    },

    {
      key: "armor",
      label: "Armor",
      render: armorTab.render,
      onAction: armorTab.onAction,
    },

    {
      key: "materials",
      label: "Materials",
      render: materialTab.render,
      onAction: materialTab.render,
    },

    {
      key: "trophies",
      label: "Trophies",
      render: trophyTab.render,
      onAction: trophyTab.onAction,
    },
  ];
}

export function equipOwnedItem(key, isWeapon) {
  if (isWeapon) {
    if (player.ownedWeapons.includes(key)) player.weapon = key;
  } else if (player.ownedArmors.includes(key)) {
    const item = ARMORS[key];
    if (item) player.armorSlots[item.slot] = key;
  }
  renderVillage();
}
