# AI Baby Activity Generator
**Phase:** P2
**Depends on:** Baby Mode (Today's Activity card on Baby Mode home screen)

## What It Does
Generates on-demand, step-by-step rhythm activity plans for parent-baby sessions. The parent inputs the baby's age and available tools (drum, spoons, clapping only, etc.), and Claude returns a complete 2-3 minute activity plan with timed steps, specific instructions, and safety notes. All generated activities pass through a safety filter before display to ensure no physically unsafe suggestions are shown.

## Interfaces
```typescript
interface BabyActivityRequest {
  babyAge: number;                        // age in months
  availableTools: string[];               // e.g. ["wooden spoon", "pot", "clapping"]
  polyrhythmToIntroduce?: string;         // optional, e.g. "3:2"
  durationPreference: number;             // preferred total duration in minutes (1-5)
}

interface BabyActivityResponse {
  title: string;                          // e.g. "Spoon Tap Groove"
  steps: {
    instruction: string;                  // plain-language parent instruction
    durationSeconds: number;              // how long this step should take
  }[];
  safetyNote?: string;                    // e.g. "Keep spoon away from baby's face"
}
```

## Safety
All generated activities pass through a safety filter before display:
- No suggestions involving small objects that pose choking hazards
- No activities requiring the baby to be unsupported or in an unsafe position
- No loud or sudden sounds that could startle or harm hearing
- Safety filter runs as a post-processing step on the Claude response before rendering

## Extension Points
- **"Today's Activity" card on Baby Mode home screen** — MVP Baby Mode home shows curated activity cards. P2 adds a "Generate Activity" button on the Today's Activity card that opens the input form (age auto-filled from baby profile, tools selected via toggles).
- **"Generate Activity" button** — Triggers the AI flow, shows a loading state, then renders the generated activity as a step-by-step swipeable card sequence matching the existing activity card design.

## Data Shapes
```
generated_activities
  id              UUID PRIMARY KEY
  babyProfileId   UUID REFERENCES baby_profiles(id)
  request         JSONB               -- BabyActivityRequest
  response        JSONB               -- BabyActivityResponse
  parentRating    INTEGER NULLABLE    -- 1-5 star rating after completing activity
  createdAt       TIMESTAMPTZ
```
