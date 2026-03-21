import { parse, format, startOfDay, differenceInMinutes, addMinutes, isAfter } from 'date-fns';
import { mean } from 'mathjs';
import { v4 as uuidv4 } from 'uuid';

const mergeNaps = (sleeps, threshold) => {
  if (sleeps.length < 2) {
    return sleeps;
  }

  const sortedSleeps = [...sleeps].sort((a, b) => a.start - b.start);
  const merged = [sortedSleeps[0]];

  for (let i = 1; i < sortedSleeps.length; i++) {
    const last = merged[merged.length - 1];
    const current = sortedSleeps[i];
    const diff = differenceInMinutes(current.start, last.end);

    if (diff <= threshold) {
      last.end = current.end;
    } else {
      merged.push(current);
    }
  }

  return merged;
};


// Simple clustering algorithm to group naps by time windows
const clusterNaps = (naps) => {
  const clusters = {
    'Morning Nap': [],
    'Afternoon Nap': [],
    'Evening Nap': [],
  };

  naps.forEach(nap => {
    const hour = nap.start.getHours();
    if (hour >= 7 && hour < 12) {
      clusters['Morning Nap'].push(nap);
    } else if (hour >= 12 && hour < 17) {
      clusters['Afternoon Nap'].push(nap);
    } else if (hour >= 17 && hour < 21) {
      clusters['Evening Nap'].push(nap);
    }
  });

  return clusters;
};

export const calculateTypicalDay = (data, options) => {
  const relevantData = data.filter(d => (d.Type === 'Sleep' || d.Type === 'Feed') && d.Start);

  const parsedData = relevantData.map(d => {
    const start = parse(d.Start, 'yyyy-MM-dd HH:mm', new Date());
    const end = d.End ? parse(d.End, 'yyyy-MM-dd HH:mm', new Date()) : null;
    return {
      ...d,
      start,
      end,
      date: format(start, 'yyyy-MM-dd'),
    };
  });

  const groupedByDay = parsedData.reduce((acc, d) => {
    const day = d.date;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(d);
    return acc;
  }, {});

  const recentDays = Object.keys(groupedByDay).sort().slice(-options.daysToConsider);
  const recentData = recentDays.map(day => groupedByDay[day]);

  // Calculate typical sleep times
  const sleepEvents = recentData.flat().filter(d => d.Type === 'Sleep' && d.end);

  const [overnightStartHour] = options.overnightStart.split(':').map(Number);
  const [overnightEndHour] = options.overnightEnd.split(':').map(Number);

  const sleepsByType = sleepEvents.reduce((acc, sleep) => {
    const hour = sleep.start.getHours();
    if (hour >= overnightStartHour || hour < overnightEndHour) {
      acc.overnight.push(sleep);
    } else {
      acc.naps.push(sleep);
    }
    return acc;
  }, { overnight: [], naps: [] });
  
  const mergedNaps = mergeNaps(sleepsByType.naps, options.napMergeThreshold);
  const napClusters = clusterNaps(mergedNaps);

  const napStats = Object.entries(napClusters).map(([name, naps]) => {
    if (naps.length === 0) return null;
    const startTimes = naps.map(n => (n.start.getHours() * 60) + n.start.getMinutes());
    const durations = naps.map(n => differenceInMinutes(n.end, n.start));
    return {
      name,
      start: mean(startTimes),
      duration: mean(durations),
    };
  }).filter(Boolean);

  const overnightSleeps = sleepsByType.overnight;
  const overnightStartTimes = overnightSleeps.map(s => {
    let hour = s.start.getHours();
    if (hour < 12) hour += 24; // If start time is in the morning, it's part of the previous day's overnight
    return (hour * 60) + s.start.getMinutes();
  });
  const overnightEndTimes = overnightSleeps.map(s => (s.end.getHours() * 60) + s.end.getMinutes());
  
  const overnightStats = {
    start: mean(overnightStartTimes),
    end: mean(overnightEndTimes),
  };

  const typicalEvents = [];
  const today = startOfDay(new Date());

  // Add naps to typical day
  napStats.forEach((nap) => {
    const start = addMinutes(today, nap.start);
    const end = addMinutes(start, nap.duration);
    typicalEvents.push({
      id: uuidv4(),
      title: nap.name,
      start,
      end,
      resourceId: 'baby',
    });
  });
  
  // Add overnight sleep to typical day
  let overnightStart = addMinutes(today, overnightStats.start);
  let overnightEnd = addMinutes(today, overnightStats.end);

  if (isAfter(overnightStart, overnightEnd)) {
    overnightStart = addMinutes(overnightStart, -24 * 60);
  }

  // Check for overlap with first nap
  if (napStats.length > 0) {
    const firstNapStart = addMinutes(today, napStats[0].start);
    if (isAfter(overnightEnd, firstNapStart)) {
      overnightEnd = firstNapStart;
    }
  }

  typicalEvents.push({
    id: uuidv4(),
    title: 'Overnight Sleep',
    start: overnightStart,
    end: overnightEnd,
    resourceId: 'baby',
  });

  // Calculate typical feed times
  const feedsByDay = recentData.map(day => {
    return day.filter(d => d.Type === 'Feed').sort((a,b) => a.start - b.start);
  });

  const feedStats = [];
  const numFeeds = options.numNaps + 2; // Usually one more feed than naps
  for (let i = 0; i < numFeeds; i++) {
    const feeds = feedsByDay.map(d => d[i]).filter(Boolean);
    if (feeds.length > 0) {
      const startTimes = feeds.map(f => (f.start.getHours() * 60) + f.start.getMinutes());
      feedStats.push({
        start: mean(startTimes),
      });
    }
  }

  // Add feeds to typical day
  feedStats.forEach((feed, i) => {
    const start = addMinutes(today, feed.start);
    const end = addMinutes(start, 30); // Assume 30 min duration for feeds
    typicalEvents.push({
      id: uuidv4(),
      title: `Feed ${i + 1}`,
      start,
      end,
      resourceId: 'baby',
    });
  });

  return typicalEvents.sort((a,b) => a.start - b.start);
};
