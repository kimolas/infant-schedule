import React, { useState, useRef } from 'react';
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDropPkg from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay, differenceInMinutes } from "date-fns";
import { enUS } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
import { EVENT_TYPES } from "./constants";
import { calculateTotals, formatMinutes } from "./utils";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS }
});

const withDragAndDrop = withDragAndDropPkg.default || withDragAndDropPkg;
const DnDCalendar = withDragAndDrop(Calendar);
const baseDate = new Date();

const CustomEvent = ({ event }) => {
  if (event.type === 'PENDING') {
    return <div>{event.title}</div>;
  }

  const duration = differenceInMinutes(event.end, event.start);
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const formattedDuration = `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`;

  const title = event.title || EVENT_TYPES[event.type]?.label;

  if (duration <= 30) {
    return (
      <div className="text-xs overflow-hidden truncate whitespace-nowrap">
        <strong>{title}</strong>{formattedDuration && <span className="text-slate-200"> ({formattedDuration})</span>}
      </div>
    );
  }

  return (
    <div>
      <strong>{title}</strong>
      {duration > 0 && <div className="text-xs">{formattedDuration}</div>}
    </div>
  );
};


export default function ScheduleBoard({ id, layout, events, setEvents, resources, title, onTitleChange }) {
  const [modalState, setModalState] = useState({ isOpen: false, slotInfo: null, pendingEvent: null, position: { x: 0, y: 0 } });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const layoutEvents = events.filter(e => e.layout === layout);

  const displayEvents = modalState.isOpen && modalState.pendingEvent 
    ? [...layoutEvents, modalState.pendingEvent] 
    : layoutEvents;

  const validateDrop = (type, resourceId) => {
    if (type === 'PUMPING' && resourceId === 'baby') return false;
    if (type === 'FEEDING_PET' && resourceId === 'baby') return false;
    if (type === 'WORK' && resourceId === 'baby') return false;
    return true;
  };

  const handleMouseUp = (e) => {
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleSelectSlot = (slotInfo) => {
    const pendingEvent = {
      id: 'pending',
      start: slotInfo.start,
      end: slotInfo.end,
      resourceId: slotInfo.resourceId,
      title: 'Selecting...',
      type: 'PENDING',
      layout
    };

    const modalWidth = 320;
    const modalHeight = 280;
    let x = lastMouseRef.current.x + 15;
    let y = lastMouseRef.current.y + 15;

    if (x + modalWidth > window.innerWidth) x = lastMouseRef.current.x - modalWidth - 15;
    if (y + modalHeight > window.innerHeight) y = window.innerHeight - modalHeight - 15;

    setModalState({ isOpen: true, slotInfo, pendingEvent, position: { x, y } });
  };

  const handleActivitySelect = (type) => {
    const { start, end, resourceId } = modalState.slotInfo;
    
    if (validateDrop(type, resourceId)) {
      setEvents(prev => [...prev, { id: uuidv4(), start, end, resourceId, type, layout, title: EVENT_TYPES[type].label, status: 'confirmed' }]);
    } else {
      alert(`Invalid activity assignment for ${resourceId}.`);
    }
    setModalState({ isOpen: false, slotInfo: null, pendingEvent: null, position: { x: 0, y: 0 } });
  };

  const handleEventDrop = ({ event, start, end, resourceId }) => {
    if (event.id === 'pending') return;
    if (!validateDrop(event.type, resourceId)) {
      alert(`Invalid activity assignment for ${resourceId}.`);
      return;
    }
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, start, end, resourceId } : e));
  };

  const handleEventResize = ({ event, start, end }) => {
    if (event.id === 'pending') return;
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, start, end } : e));
  };

  const handleDelete = (event) => {
    if (event.id === 'pending') return;
    if (window.confirm('Delete this block?')) {
      setTimeout(() => {
        setEvents(prev => prev.filter(e => e.id !== event.id));
      }, 0);
    }
  };

  const totals = calculateTotals(events, layout, resources);

  return (
    <div id={id} className="flex flex-col h-full border border-slate-300 bg-white shadow-sm overflow-hidden relative" onMouseUpCapture={handleMouseUp}>
      <div className="flex justify-center font-bold py-2 bg-slate-100 border-b border-slate-300 z-10">
        <input
          value={title}
          onChange={onTitleChange}
          className="text-center bg-transparent focus:bg-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 w-3/4"
          placeholder="Schedule Name"
        />
      </div>
      
      <div className="flex-grow min-h-0 relative">
        <DnDCalendar
          localizer={localizer}
          events={displayEvents}
          resources={resources}
          resourceIdAccessor="id"
          resourceTitleAccessor="title"
          defaultView="day"
          views={['day']}
          step={15}
          timeslots={4}
          defaultDate={baseDate}
          toolbar={false}
          selectable
          resizable
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectEvent={handleDelete}
          components={{
            event: CustomEvent,
          }}
          eventPropGetter={(event) => {
            if (event.status === 'preview') {
              return {
                style: {
                  backgroundColor: 'rgba(100, 116, 139, 0.5)',
                  border: '2px dashed #64748b',
                }
              }
            }
            if (event.type === 'PENDING') {
              return {
                style: {
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '2px dashed #3b82f6',
                  color: '#1d4ed8',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  pointerEvents: 'none'
                }
              };
            }
            return {
              style: { 
                backgroundColor: event.type ? EVENT_TYPES[event.type]?.color : '#64748b', 
                border: 'none',
                borderRadius: '2px',
                color: '#fff', 
                fontSize: '0.75rem',
                fontWeight: '500'
              }
            };
          }}
        />
      </div>

      <div className="bg-slate-50 border-t border-slate-300 p-3 grid grid-cols-3 gap-4 text-xs z-10">
        {resources.map(r => (
          <div key={r.id} className="flex flex-col gap-1 text-slate-800">
            <span className="font-bold border-b border-slate-200 pb-1 mb-1">{r.title} Totals</span>
            {Object.entries(totals[r.id])
              // eslint-disable-next-line no-unused-vars
              .filter(([_, mins]) => mins > 0)
              .map(([type, mins]) => (
                <div key={type} className="flex justify-between">
                  <span>{EVENT_TYPES[type]?.label || type}</span>
                  <span className="font-mono">{formatMinutes(mins)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>

      {modalState.isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setModalState({ isOpen: false, slotInfo: null, pendingEvent: null, position: { x: 0, y: 0 } })}
          ></div>
          <div 
            className="fixed z-50 bg-white p-4 rounded-lg shadow-2xl border border-slate-200 w-80"
            style={{ left: `${modalState.position.x}px`, top: `${modalState.position.y}px` }}
          >
            <div className="font-bold mb-1 border-b pb-2 text-slate-800">Select Activity</div>
            <div className="text-sm font-mono text-slate-600 mb-4 text-center bg-slate-100 p-1 rounded">
              {format(modalState.slotInfo.start, 'h:mm a')} - {format(modalState.slotInfo.end, 'h:mm a')}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(EVENT_TYPES).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleActivitySelect(t.id)}
                  className="p-2 rounded text-white text-xs font-bold transition-transform active:scale-95 hover:brightness-110 shadow-sm"
                  style={{ backgroundColor: t.color }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}