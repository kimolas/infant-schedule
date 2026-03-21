import { useState, useEffect } from 'react';

export function useScheduleData() {
  const [events, setEvents] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('share');

    const normalizeEventsToToday = (eventsArray) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return eventsArray.map(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        
        const startDay = new Date(start);
        startDay.setHours(0, 0, 0, 0);
        
        const offsetMs = today.getTime() - startDay.getTime();
        
        return {
          ...e,
          start: new Date(start.getTime() + offsetMs),
          end: new Date(end.getTime() + offsetMs)
        };
      });
    };

    if (sharedData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(atob(sharedData)));
        window.history.replaceState({}, document.title, window.location.pathname);
        return normalizeEventsToToday(parsed);
      } catch (error) {
        console.error('Failed to parse shared data payload.', error);
      }
    }

    const saved = localStorage.getItem('infant_schedule_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return normalizeEventsToToday(parsed);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('infant_schedule_data', JSON.stringify(events));
  }, [events]);

  return [events, setEvents];
}

export function useResourceNames() {
  const [names, setNames] = useState(() => {
    const saved = localStorage.getItem('infant_schedule_names');
    if (saved) return JSON.parse(saved);
    return { parent1: 'Parent 1', baby: 'Baby', parent2: 'Parent 2' };
  });

  useEffect(() => {
    localStorage.setItem('infant_schedule_names', JSON.stringify(names));
  }, [names]);

  return [names, setNames];
}

export function useLayoutNames() {
  const [names, setNames] = useState(() => {
    const saved = localStorage.getItem('infant_schedule_layouts');
    if (saved) return JSON.parse(saved);
    return { nap3: '3-Nap Schedule', nap4: '4-Nap Schedule' };
  });

  useEffect(() => {
    localStorage.setItem('infant_schedule_layouts', JSON.stringify(names));
  }, [names]);

  return [names, setNames];
}