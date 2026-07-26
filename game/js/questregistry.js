const registry = new Map();

export function registerMission(mission) {
  registry.set(mission.key, mission);
}

export function getRegisteredMission(key) {
  return registry.get(key);
}

export function unregisterMission(key) {
  registry.delete(key);
}

export function hasMission(key) {
  return registry.has(key);
}

export function clearRegistry() {
  registry.clear();
}
