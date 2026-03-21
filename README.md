# Infant Schedule Planner

React-based web application for managing infant routines and caretaker responsibilities.

## Features

* **Multi-Entity Tracking:** Three-column vertical timeline assigning distinct activities to specific entities. Custom nomenclature supported.
* **Layout Comparison:** Side-by-side execution of different routine structures (e.g., 3-nap vs. 4-nap schedules) with synchronized scrolling.
* **Drag-and-Drop Interaction:** Granular 15-minute interval scheduling with strictly validated drop targets based on activity constraints.
* **Dynamic Aggregation:** Real-time computation of total durations per activity type, partitioned by entity.
* **State Persistence:** Automatic local storage synchronization.
* **Stateless Sharing:** URL parameter serialization via Base64 encoding for cross-device template transfer.

## Technology Stack

* **Framework:** React (Vite)
* **Styling:** Tailwind CSS v4 (PostCSS)
* **Calendar Engine:** `react-big-calendar` with `react-dnd` (HTML5 Backend)
* **Date Operations:** `date-fns`

## Installation

1.  Clone repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Execute development server:
    ```bash
    npm run dev -- --host
    ```
4.  Compile for production deployment (requires relative base path in `vite.config.js` for static hosting environments):
    ```bash
    npm run build
    ```

## Core Architecture

* **Event Schema:** Flat state array. Objects define `id`, `start`, `end`, `type`, `resourceId`, and `layout`.
* **Time Normalization:** Application engine shifts all stored timestamp data to align with the current execution date upon initialization. Functions as an invariant daily template.
* **Constraint Validation:** Pre-computation interception logic prevents invalid state assignments (e.g., `WORK` cannot be assigned to the infant column).
* **DOM Event Handling:** Scroll synchronization bypasses React synthetic events, attaching directly to native browser scroll listeners to prevent render loops.