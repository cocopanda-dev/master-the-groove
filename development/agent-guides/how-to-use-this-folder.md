# How to Use This Development Folder

This folder contains the complete spec-driven development system for GrooveCore. Each agent (Claude Code session or subagent) should read only the docs relevant to its task — never the entire folder.

---

## Quick Start

1. Read `master-todolist.md` to understand where your work fits in the build order
2. Check the table below to find your required reading
3. Read those files
4. Do the work
5. Update `tasks.md` as you complete items

---

## Required Reading by Task Type

| Task Type | Always Read | Then Read |
|---|---|---|
| **Any task** | `contracts/coding-conventions.md` | — |
| **Foundation work** | `contracts/data-models.md` | The specific foundation `spec.md` + `tasks.md` |
| **Feature work** | `contracts/data-models.md`, `contracts/design-tokens.md` | The specific feature `spec.md` + `tasks.md` + any foundation spec it depends on |
| **Baby mode work** | All of the above | Pay special attention to baby mode overrides in `contracts/design-tokens.md` |
| **Audio-related feature** | All of the above + `foundations/audio-engine/spec.md` | The feature spec |
| **Data/persistence work** | `contracts/api-contracts.md`, `contracts/data-models.md` | `foundations/data-layer/spec.md` |
| **Stub-aware work** | The relevant stub file in `stubs/` | To understand what extension points to leave |

---

## Rules for Agents

1. **Never read everything.** Read only what's listed for your task type above. The whole point of this structure is scoped context.

2. **Check `master-todolist.md` first.** Understand where your work fits in the build order and what dependencies must be completed before you start.

3. **Respect boundaries.** Each spec defines a boundary section. If your spec says "consumes audio engine store slice" — use the store actions and selectors. Don't modify the audio engine internals or import from `src/lib/audio/` directly.

4. **Leave extension points.** Check `stubs/` for anything that plugs into your feature. Add disabled placeholders (grayed-out buttons, no-op hooks, empty slots), not implementations. The stub file tells you exactly where the extension point goes.

5. **Update your `tasks.md`** as you complete items. Check off done tasks. If you make a decision that deviates from the spec, note it inline.

6. **Don't modify contract files** (`contracts/`) without explicit coordination. They're shared across all features — changes affect everyone. If you need a contract change, flag it rather than making the edit.

7. **Follow coding conventions.** `contracts/coding-conventions.md` is non-negotiable. Named exports, Zustand patterns, import ordering, file naming — follow them exactly.

8. **Types come from one place.** All TypeScript types live in `src/types/index.ts`, which mirrors `contracts/data-models.md`. Don't re-declare types in feature code.

---

## How to Dispatch a Subagent

When dispatching a subagent for a specific feature, include in the prompt:

```
Read these files before starting:
- development/contracts/coding-conventions.md
- development/contracts/data-models.md
- development/features/<feature>/spec.md
- development/features/<feature>/tasks.md
[add any additional deps from the Required Reading table]

Your task: [specific task or epic from tasks.md]

Constraints:
- Follow all patterns in coding-conventions.md
- All types come from src/types/index.ts
- Do not modify files outside your feature scope
- Leave extension points noted in the spec (check stubs/ if referenced)
```

### Example: Dispatching an agent for Baby Mode

```
Read these files before starting:
- development/contracts/coding-conventions.md
- development/contracts/data-models.md
- development/contracts/design-tokens.md (especially baby mode overrides)
- development/foundations/audio-engine/spec.md (for duet tap and visualizer audio)
- development/features/baby-mode/spec.md
- development/features/baby-mode/tasks.md
- development/stubs/ai-baby-activity-gen.md (leave extension point for P2)

Your task: Implement tasks 1-8 from baby-mode/tasks.md

Constraints:
- Follow all patterns in coding-conventions.md
- Baby mode screens must use baby palette from design-tokens.md
- Audio interaction through audioStore only
- Leave "Today's Activity" slot for AI generator (stub)
- Minimum tap target 80px in all baby screens
```

---

## How to Mark Progress

In `tasks.md` files:
- `[ ]` — Not started
- `[x]` — Completed
- `[~]` — Partially done (add note explaining what remains)
- `[!]` — Blocked (add note explaining the blocker)

Add inline notes for decisions:

```markdown
- [x] **Task 3: Implement stereo split**
  > Decision: used expo-av pan property instead of separate audio channels.
  > Tested on iOS and Android, works on both.
```

---

## Folder Map

```
development/
├── master-todolist.md           ← Start here. Build order + deps.
├── contracts/                   ← Shared rules. Read what your task needs.
│   ├── data-models.md           ← All TypeScript types
│   ├── api-contracts.md         ← Supabase schema, sync rules
│   ├── design-tokens.md         ← Colors, spacing, sounds, animations
│   └── coding-conventions.md    ← How to write code in this project
├── foundations/                  ← Built first. Features depend on these.
│   ├── audio-engine/            ← All sound scheduling and playback
│   ├── navigation-shell/        ← App skeleton, tabs, routing
│   └── data-layer/              ← Zustand stores, Supabase, offline sync
├── features/                    ← Built after foundations. Parallelizable.
│   ├── core-player/             ← Main polyrhythm player screen
│   ├── feel-lessons/            ← Structured lesson system
│   ├── disappearing-beat/       ← Staged muting training
│   ├── baby-mode/               ← Parent-child rhythm experience
│   ├── progress-tracking/       ← Practice history and feel states
│   └── onboarding/              ← First-launch setup flow
├── stubs/                       ← P1-P3 placeholders. Extension points.
└── agent-guides/                ← You are here.
    └── how-to-use-this-folder.md
```
