import { differenceInMinutes } from 'date-fns';
import { EVENT_TYPES } from './constants';

export function calculateTotals(events, layout, resources) {
  const totals = {};
  resources.forEach(r => {
    totals[r.id] = {};
    Object.keys(EVENT_TYPES).forEach(type => totals[r.id][type] = 0);
  });

  events.filter(e => e.layout === layout).forEach(event => {
    if (totals[event.resourceId] && totals[event.resourceId][event.type] !== undefined) {
      totals[event.resourceId][event.type] += differenceInMinutes(
        new Date(event.end), 
        new Date(event.start)
      );
    }
  });

  return totals;
}

export function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}