import React, { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import ScheduleBoard from './ScheduleBoard';
import ImportView from './ImportView';
import { useScheduleData, useResourceNames, useLayoutNames } from './useScheduleData';
import { LAYOUTS } from './constants';
import { calculateTypicalDay } from './huckleberryImporter';

export default function App() {
  const [events, setEvents] = useScheduleData();
  const [names, setNames] = useResourceNames();
  const [layoutNames, setLayoutNames] = useLayoutNames();
  const [isImporting, setIsImporting] = useState(false);
  const [eventsBackup, setEventsBackup] = useState(null);
  const hasPreview = events.some(e => e.status === 'preview');

  const handleShare = () => {
    const payload = btoa(encodeURIComponent(JSON.stringify(events.filter(e => e.status !== 'preview'))));
    const url = `${window.location.origin}${window.location.pathname}?share=${payload}`;
    navigator.clipboard.writeText(url);
    alert('Shareable link copied to clipboard.');
  };

  const handleImport = (data, options) => {
    setEventsBackup(events);
    const typicalDay = calculateTypicalDay(data, options).map(e => ({ ...e, layout: options.targetLayout, status: 'preview' }));
    setEvents(prev => [...prev.filter(e => e.layout !== options.targetLayout), ...typicalDay]);
    setIsImporting(false);
  };

  const confirmImport = () => {
    setEvents(prev => prev.map(e => e.status === 'preview' ? { ...e, status: 'confirmed' } : e));
  };

  const cancelImport = () => {
    setEvents(eventsBackup);
    setEventsBackup(null);
  };

  const undoImport = () => {
    setEvents(eventsBackup);
    setEventsBackup(null);
  };

  useEffect(() => {
    const leftCal = document.querySelector('#calendar-left .rbc-time-content');
    const rightCal = document.querySelector('#calendar-right .rbc-time-content');

    if (!leftCal || !rightCal) return;

    let isSyncingLeft = false;
    let isSyncingRight = false;

    const handleLeftScroll = (e) => {
      if (isSyncingLeft) {
        isSyncingLeft = false;
        return;
      }
      isSyncingRight = true;
      rightCal.scrollTop = e.target.scrollTop;
    };

    const handleRightScroll = (e) => {
      if (isSyncingRight) {
        isSyncingRight = false;
        return;
      }
      isSyncingLeft = true;
      leftCal.scrollTop = e.target.scrollTop;
    };

    leftCal.addEventListener('scroll', handleLeftScroll);
    rightCal.addEventListener('scroll', handleRightScroll);

    return () => {
      leftCal.removeEventListener('scroll', handleLeftScroll);
      rightCal.removeEventListener('scroll', handleRightScroll);
    };
  }, []);

  const resources = [
    { id: 'parent1', title: names.parent1 },
    { id: 'baby', title: names.baby },
    { id: 'parent2', title: names.parent2 }
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      {isImporting && <ImportView onImport={handleImport} onCancel={() => setIsImporting(false)} />}
      <div className="h-screen w-screen p-4 bg-slate-200 dark:bg-slate-800 flex flex-col font-sans">
        <div className="flex justify-between items-center mb-4 bg-white dark:bg-slate-900 p-3 rounded shadow-sm border border-slate-300 dark:border-slate-700">
          <div className="flex gap-4 items-center">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 mr-4">Infant Schedule Planner</h1>
            <input 
              value={names.parent1} 
              onChange={e => setNames(n => ({...n, parent1: e.target.value}))} 
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 font-semibold" 
              placeholder="Parent 1" 
            />
            <input 
              value={names.baby} 
              onChange={e => setNames(n => ({...n, baby: e.target.value}))} 
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 font-semibold" 
              placeholder="Baby" 
            />
            <input 
              value={names.parent2} 
              onChange={e => setNames(n => ({...n, parent2: e.target.value}))} 
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 font-semibold" 
              placeholder="Parent 2" 
            />
          </div>
          <div className="flex gap-4 items-center">
            {hasPreview && (
              <>
                <button 
                  onClick={confirmImport}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
                >
                  Confirm Import
                </button>
                <button 
                  onClick={cancelImport}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Cancel Import
                </button>
              </>
            )}
            {eventsBackup && !hasPreview && (
              <button 
                onClick={undoImport}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-700 transition-colors shadow-sm"
              >
                Undo Import
              </button>
            )}
            <button 
              onClick={() => setIsImporting(true)}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
            >
              Import from Huckleberry
            </button>
            <button 
              onClick={handleShare}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Copy Share Link
            </button>
          </div>
        </div>
        <div className="flex-grow grid grid-cols-2 gap-4 min-h-0">
          <ScheduleBoard 
            id="calendar-left" 
            layout={LAYOUTS.NAP_3} 
            events={events} 
            setEvents={setEvents} 
            resources={resources} 
            title={layoutNames.nap3}
            onTitleChange={e => setLayoutNames(n => ({...n, nap3: e.target.value}))}
          />
          <ScheduleBoard 
            id="calendar-right" 
            layout={LAYOUTS.NAP_4} 
            events={events} 
            setEvents={setEvents} 
            resources={resources}
            title={layoutNames.nap4}
            onTitleChange={e => setLayoutNames(n => ({...n, nap4: e.target.value}))}
          />
        </div>
      </div>
    </DndProvider>
  );
}