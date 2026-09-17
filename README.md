# Awais Reset Protocol — R1.2

A mobile-first, local-first foundation for a personal fitness execution system. Its operating loop is **Command → Execute → Record → Adapt → Return**. No streak is required; the system counts returns and does not punish gaps.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. To validate or serve a production build:

```bash
npm run build
npm run lint
npm test
npm run preview
```

`npm run build` includes the strict TypeScript project check. `npm test` runs the session service tests.

## Architecture

```text
src/
  components/       Exercise education, mode choice, and session history
  data/             Provisional Strength A/B and exercise reference data
  domain/           Profile, workout, session, nutrition, and running-stage models
  screens/          Today, Train, active workout, debrief, Food, Progress, Learn
  services/         Session state, set/cardio logging, A/B selection, migration
  storage/          Versioned localStorage implementation behind StorageAdapter
  App.tsx           Shell, navigation, and app-level state
  index.css         Tailwind entry and responsive visual system
public/            SVG, Android PNG, and iPhone Home Screen icons
scripts/           Local icon generation source
vite.config.ts      React, Tailwind, and PWA configuration
vercel.json         Static Vite build/output configuration
tests/              Domain and persistence tests
```

The UI reads and writes `AppData` through `appService`, which uses `StorageAdapter`. Data is saved in a **version 2** envelope under the existing `awais-reset-r0` key. Version 1 data is migrated on load: a legacy active preview becomes a loggable active session, completed history gains status fields, and the next A/B mission is derived from completed normal sessions. Invalid or incompatible data falls back to clean data. Workout definitions remain separate from session history. The cached `nextWorkoutDefinitionId` is recalculated from completed normal Strength A/B history on save, deletion, and load. RESET preserves the due mission. Calendar gaps never advance it.

## PWA behavior

The production build generates a manifest with the full name **Awais Reset Protocol**, short name **Reset**, standalone display, and 192/512 px PNG icons. It also generates a service worker that caches the app shell for repeat/offline loading after an initial online visit. An iPhone Home Screen icon and standalone/status-bar metadata are included. The viewport and layout account for the phone's top and bottom safe areas. Install behavior depends on browser support and a secure origin; Vercel supplies HTTPS, while localhost works for development.

### Deploy to Vercel

1. Put this project in a Git repository and import it in Vercel, or run `npx vercel` from the project root and follow the CLI prompts. This repository has no backend or server functions.
2. Use the **Vite** framework preset. [vercel.json](vercel.json) sets `npm run build` and the `dist` output directory explicitly. The default install command can use `package-lock.json`.
3. Deploy, then open the HTTPS deployment URL on a phone. Check that the app loads, the manifest/icon are present, and the install option appears in the browser menu.

Vercel's [Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite) and [build configuration guide](https://vercel.com/docs/builds/configure-a-build) describe these settings. No environment variables are needed in R0.

### Install on Android

Open the deployed HTTPS URL in Chrome. Tap **⋮** beside the address bar, then **Install app** (or **Install and create shortcut**, depending on the Chrome version), and confirm **Install**. Launch **Reset** from the Home Screen or app list. See [Google's web app instructions](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en).

### Install on iPhone

Open the deployed HTTPS URL in Safari. Tap **Share**, choose **Add to Home Screen**, enable **Open as Web App** if shown, then tap **Add**. Launch **Reset** from the Home Screen. See [Apple's iPhone instructions](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios).

### Local data limitations

R1 stores data in this browser's `localStorage`. Active sessions, draft values, completed sets, cardio, debrief choices, and saved history survive ordinary refreshes. Data can disappear if browser/site data is cleared, storage is evicted, or the browser is used in a temporary/private session. Storage is tied to the exact site origin, so a Vercel preview URL and the production URL have separate data. There is no export, account, or cloud backup in R1. **Different browsers and devices do not share workout history or active session state.** Installing on a second phone starts with fresh local data. Offline shell availability depends on the browser retaining its service-worker cache.

## R1.2 scope

- Mobile-first shell with five destinations and persistent bottom navigation
- Today mission, Green/Amber choice, compact signals, and mental signal
- Train mission and expandable movement guidance
- Live strength set logging with editable weight, reps, effort, and optional extra sets
- Cardio logging for duration and applicable speed/incline fields
- Persisted active session, exercise position, and compact completion debrief
- Recent sessions with logged detail, previous completed performance, and confirmed deletion of saved workouts
- Light clinical visual system with responsive anatomy diagrams, structured Overview / How To / Tutorial education, and an Exercise Library in Learn

The anatomy artwork is a locally bundled, project-owned generated illustration at `public/anatomy/anatomy-muscular-figures.png`; it is not hotlinked and has no third-party attribution requirement. Tutorial media remains an explicit “Demonstration coming soon” state until approved media is supplied.
- Provisional calibration workouts A and B, plus future mode and running-stage types
- Food, Progress, and Learn structures with honest empty states
- Explicit GREEN, AMBER, and RESET start modes with shorter configured plans for AMBER/RESET; discard confirmation; A/B sequence and return events

Starting a session creates one active `WorkoutSession` immediately. Every set, cardio field, and debrief choice updates the local session. **Complete workout** leads to a confirmation and debrief; **Save session** writes completed history and clears the active session. A RESET save records a return event and leaves the next normal A/B mission unchanged. The baseline weight remains reference data, not a logged weigh-in. Hydration and food check-in models exist, but entry controls are deferred.

Open a saved workout from **Recent sessions** to delete it. The confirmation removes the complete session and its associated return event, if any. History, Today, Progress, the next mission, and previous performance then use the remaining sessions. This deletion is permanent in the current browser; cancelling the dialog leaves all data unchanged. **Discard active session** remains a separate action for an unfinished workout.

## Deferred to later releases

Progression recommendations, automatic Reset detection, evidence-based running-stage transitions, weight/water/food entry, charts, cloud sync, accounts, wearables, notifications, and subscriptions. R2 should focus on adaptive behavior and progression only after reviewing R1 gym usage.
