import { differenceInMinutes } from 'date-fns';
import { EVENT_TYPES } from './constants';

export function calculateTotals(events, layout, resources) {
  const totals = {};
  resources.forEach(r => {
    totals[r.id] = {};
    Object.keys(EVENT_TYPES).forEach(type => totals[r.id][type] = 0);
    totals[r.id].FREE = 0;
  });

  let totalMinutes = {};
  resources.forEach(r => {
    totalMinutes[r.id] = 0;
  });

  events.filter(e => e.layout === layout).forEach(event => {
    if (totals[event.resourceId] && totals[event.resourceId][event.type] !== undefined) {
      const duration = differenceInMinutes(
        new Date(event.end), 
        new Date(event.start)
      );
      totals[event.resourceId][event.type] += duration;
      totalMinutes[event.resourceId] += duration;
    }
  });

  resources.forEach(r => {
    totals[r.id].FREE = 1440 - totalMinutes[r.id];
  });

  return totals;
}

export function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}