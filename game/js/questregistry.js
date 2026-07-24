const registry = new Map();

export function registerMission(mission) {
  registry.set(mission.key, mission);
}

export function getRegisteredMission(key) {
  return registry.get(key);
}