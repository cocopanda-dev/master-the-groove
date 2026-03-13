# GrooveCore — Development Folder Architecture Design

**Date:** 2026-03-13
**Author:** Chao + Claude
**Status:** Approved
**PRD Version:** 0.1

## Context

GrooveCore is a feel-first rhythm training app (Expo/React Native, iOS & Android) with an adult musician mode and a parent-baby bonding mode. The PRD defines 4 phases (P0 MVP through P3).

This document specifies the architecture of the `development/` folder — a spec-driven development system where each agent (Claude Code session or subagent) only reads the docs relevant to its task.

## Design Decisions

1. **Hybrid decomposition** — Foundation specs (audio engine, navigation, data layer) are built first. Feature specs are vertical (end-to-end per feature) and reference foundations as dependencies.
2. **Two-tier todolists** — A master todolist with epic-level build order + per-spec detailed task breakdowns.
3. **Separate contract files** — Shared types, API contracts, design tokens, and coding conventions in modular files. Agents pick only the contracts relevant to their feature.
4. **MVP + stubs** — Full specs for P0 features. Lightweight placeholder specs for P1-P3 features that define interfaces, data shapes, and extension points so MVP code doesn't paint into corners.
5. **Domain-grouped folders** — Each feature gets its own folder with spec.md and tasks.md. Foundations are separated from features. Stubs live apart.

## Folder Structure

```
development/
├── master-todolist.md
├── contracts/
│   ├── data-models.md
│   ├── api-contracts.md
│   ├── design-tokens.md
│   └── coding-conventions.md
├── foundations/
│   ├── audio-engine/
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── navigation-shell/
│   │   ├── spec.md
│   │   └── tasks.md
│   └── data-layer/
│       ├── spec.md
│       └── tasks.md
├── features/
│   ├── core-player/
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── feel-lessons/
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── disappearing-beat/
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── baby-mode/
│   │   ├── spec.md
│   │   └── tasks.md
│   ├── progress-tracking/
│   │   ├── spec.md
│   │   └── tasks.md
│   └── onboarding/
│       ├── spec.md
│       └── tasks.md
├── stubs/
│   ├── ai-vocal-coach.md
│   ├── ai-stuck-coach.md
│   ├── body-layer-mode.md
│   ├── composite-visualizer.md
│   ├── real-music-context.md
│   ├── ai-song-recommender.md
│   ├── ai-mnemonic-generator.md
│   ├── ai-progress-narrator.md
│   ├── ai-baby-activity-gen.md
│   ├── adaptive-tempo-coach.md
│   ├── educator-tools.md
│   └── social-streaks.md
└── agent-guides/
    └── how-to-use-this-folder.md
```

## Master Todolist Structure

The master-todolist.md defines epics, dependencies, phase, and required reading per epic.

### Build Order & Dependencies

**Phase 0: Foundations (sequential)**
- Epic 1: Project Scaffolding — Deps: none
- Epic 2: Audio Engine — Deps: Epic 1
- Epic 3: Data Layer — Deps: Epic 1
- Epic 4: Navigation Shell — Deps: Epic 1

**Phase 1: MVP Features (parallelizable after foundations)**
- Epic 5: Onboarding Flow — Deps: Epic 3, Epic 4
- Epic 6: Core Player — Deps: Epic 2, Epic 4
- Epic 7: Feel Lessons (3:2) — Deps: Epic 2, Epic 6
- Epic 8: Disappearing Beat Mode — Deps: Epic 2, Epic 6
- Epic 9: Baby Mode — Deps: Epic 3, Epic 4
- Epic 10: Progress Tracking — Deps: Epic 3, Epic 4

**Phase 2: Integration & Polish**
- Epic 11: End-to-End Integration — Deps: Epics 5-10
- Epic 12: Testing & QA — Deps: Epic 11

### Parallelization Map

```
Epic 1 (scaffold)
  ├── Epic 2 (audio) ──┬── Epic 6 (core player) ──┬── Epic 7 (lessons)
  │                     │                           └── Epic 8 (disappearing beat)
  ├── Epic 3 (data) ───┼── Epic 5 (onboarding)
  │                     ├── Epic 9 (baby mode)
  └── Epic 4 (nav) ────┴── Epic 10 (progress)
```

## Contract Files

### data-models.md
All shared TypeScript types and entities:
- UserProfile, Polyrhythm, Session, FeelState enum, BabyProfile, BabySession, LessonProgress
- Stub types for P1+ (AICoachRequest, AICoachResponse, VocalOnsetData, etc.)

### api-contracts.md
- Supabase schema (tables for users, sessions, baby_sessions, lesson_progress)
- Auth flow (anonymous for MVP, email later)
- Claude API call shapes (P1+ stubs)
- Offline-first rules (local-first write, background sync, reconnection)

### design-tokens.md
- Color palette (primary, secondary, accent, baby mode high-contrast warm palette)
- Typography, spacing scale
- Sound palette (click, clave, woodblock, djembe, handpan, soft baby tones)
- Animation constants (tempo-linked easing, pulse parameters)
- Baby mode overrides (larger tap targets, simplified colors, gentler animations)

### coding-conventions.md
- File naming (kebab-case files, PascalCase components)
- Expo Router folder structure conventions
- Component pattern (functional, props interfaces, co-located styles)
- State pattern (Zustand slices, selectors, no direct Supabase access from features)
- Audio pattern (interact through store only)
- Testing and error handling conventions

## Foundation Specs

### audio-engine/spec.md
Polyrhythm scheduler, sound loader, stereo split, per-layer volume + fade curves, tempo engine with tap tempo, transport controls, beat callbacks. Extension points for mic input (P1), accelerometer (P1), onset detection (P1).

Boundary: Knows nothing about UI or features. Exposes a Zustand store slice and callbacks.

### navigation-shell/spec.md
Expo Router layout, 5-tab bar, screen registry, tab bar behavior (baby mode visual switch), modal/sheet patterns, deep linking structure.

Boundary: Renders skeleton and routes. Features own their screens.

### data-layer/spec.md
Zustand store architecture (userStore, sessionStore, lessonStore, babyStore, settingsStore), Supabase integration, offline-first strategy, session recording lifecycle. Extension points for AI response caching (P2), vocal analysis storage (P1).

Boundary: Single gateway to persistence. No feature touches Supabase directly.

## Feature Specs (MVP)

### onboarding — 4-screen first-launch flow, writes profile to userStore, determines tab visibility
### core-player — ratio selector, BPM slider, sound selector, stereo split toggle, radial visualizer, volume sliders, tap tempo, screen awake
### feel-lessons — step-based lesson engine, 3:2 content, JSON-driven content model for extensibility, feel badge on completion
### disappearing-beat — 3-stage muting engine, configurable layer/bars/cycles, fade logic, drift feedback on return
### baby-mode — stage system (1-3 at MVP), activity cards, duet tap, baby visualizer, session log, warm UI theme
### progress-tracking — feel status dashboard, self-report prompt, session history, weekly overview

## Stubs (P1-P3)

Each stub follows a consistent format: What It Does, Interfaces (TypeScript), Extension Points (where in MVP code it plugs in), Data Shapes (new entities/fields).

| Stub | Phase | Plugs Into |
|---|---|---|
| ai-vocal-coach | P1 | Sing & Tap step, mic input hook |
| ai-stuck-coach | P1 | Help button on lesson/practice screens |
| body-layer-mode | P1 | New Practice tab screen, accelerometer hook |
| composite-visualizer | P1 | Visualization option on core player |
| real-music-context | P1 | Lesson step 1, new Learn tab screen |
| ai-song-recommender | P2 | "Hear in real music" button |
| ai-mnemonic-generator | P2 | "Generate mine" button on mnemonic card |
| ai-progress-narrator | P2 | Weekly summary in progress tab |
| ai-baby-activity-gen | P2 | "Today's Activity" in baby mode |
| adaptive-tempo-coach | P2 | Tempo control, session analysis |
| educator-tools | P3 | New tab/mode |
| social-streaks | P3 | Progress tab, social feed |

## Agent Guide

The agent-guides/how-to-use-this-folder.md maps task types to required reading:

| Task | Always Read | Then Read |
|---|---|---|
| Any task | coding-conventions.md | — |
| Foundation work | data-models.md | Specific foundation spec + tasks |
| Feature work | data-models.md, design-tokens.md | Feature spec + tasks + dependency foundation specs |
| Baby mode work | Above + design-tokens.md baby overrides | baby-mode spec |
| Audio-related feature | Above + audio-engine spec | Feature spec |
| Data/persistence work | api-contracts.md | data-layer spec |

Rules: Never read everything. Check master-todolist first. Respect boundaries. Leave extension points from stubs. Update tasks.md as you go. Don't modify contracts without coordination.
