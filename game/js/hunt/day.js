import { world } from '../state.js';

/**
 * Advances the game by one full day.
 * Called exactly once per completed hunt (win, flee, or defeat) —
 * resting and village navigation do NOT advance the day, since a hunt
 * itself is the only action defined as taking a full day.
 * @returns {number} the new current day
 */
export function advanceDay() {
  world.day += 1;

  // Future hook points (Day System roadmap):
  // - resolveFarmGrowth(world.day);
  // - rollDailyShopDeals(world.day);
  // - checkWeatherEvents(world.day);

  console.log(`[Day System] Advanced to Day ${world.day}`);

  return world.day;
}