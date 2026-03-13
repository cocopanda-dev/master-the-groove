# Baby Mode — Feature Spec

A fully separate experience within the app for parent-child rhythmic bonding. This is not a stripped-down version of the adult mode — it is a redesigned flow where the parent is the primary user and the baby is the experience. Sessions are short (under 3 minutes), multimodal, socially rich, and completely free of scoring or failure states.

---

## Design Principles

- **The parent is the primary user** — the baby is the experience
- **Sessions are under 3 minutes** — baby attention spans are short
- **Multimodal + social** — combines movement, sound, touch, and eye contact
- **Parent guidance is explicit** — every screen tells the parent exactly what to do
- **Visuals delight the baby** — high contrast, large shapes, warm colors, gentle animations
- **No scoring, no fail states** — pure positive reinforcement
- **All tap targets minimum 80px** — large enough for guided baby hands

---

## Stage System

Stages map to developmental milestones and determine which activities and features are available.

| Stage | Age Range | Mode Name | Focus |
|---|---|---|---|
| Stage 1 | 3–6 months | Parent Bounce Mode | Parent moves baby to the beat with on-screen cues |
| Stage 2 | 6–12 months | Pat-a-Cake Mode | Simple call-response clapping activities |
| Stage 3 | 12–18 months | Tap Mode | Baby taps oversized on-screen targets |

### Stage Determination
- **Auto-calculated** from baby profile birth date: `stage = ageToStage(babyProfile.birthDate)`
- **Manual override** available in baby settings (some babies develop faster/slower)
- Stage determines which activity cards appear and which features are enabled
- Stage 0 (0–3 months, passive listening) is excluded from MVP — parents at this stage are directed to use the Core Player with soft sounds
- Stages 4–5 (18 months–5 years) are post-MVP — data-only additions

### Age-to-Stage Mapping
```
0–2 months:   Not yet supported (show message: "Baby mode starts at 3 months")
3–6 months:   Stage 1
6–12 months:  Stage 2
12–18 months: Stage 3
18+ months:   Stage 3 (MVP ceiling, with "More stages coming soon" note)
```

---

## Baby Mode Home Screen

### Layout
- **Current stage banner:** "Stage 2: Pat-a-Cake Mode" with baby name and calculated age (e.g., "Luna, 8 months")
- **"Today's Activity" card:** a single featured activity card, curated at MVP. Tapping opens the activity detail.
  - P2 extension slot: AI-generated daily activity based on baby's age, recent sessions, and available tools
- **Activity card stack:** horizontally swipeable cards showing all activities available for the current stage
- **Quick launch buttons:** two prominent buttons:
  - "Duet Tap" — launches the Duet Tap screen
  - "Baby Visualizer" — launches the Baby Visualizer screen
- **Session log shortcut:** "View Sessions" link/button at the bottom, navigates to session history

### Navigation
- Baby Mode is a top-level tab (hidden if user role is musician-only, set during onboarding)
- Tab icon uses the baby palette tint when active

---

## Activity Cards

### Content Structure
- Defined in JSON data files, organized by stage
- Each card is a `BabyActivityCard` object:
  ```typescript
  interface BabyActivityCard {
    id: string;
    stageId: number;            // 1, 2, or 3
    title: string;              // Short title (e.g., "Bounce & Count")
    instruction: string;        // Single instruction, large font, simple language
    durationSeconds: number;    // Suggested duration (30–90 seconds)
    audioConfig?: {             // Optional background beat
      bpm: number;
      sound: SoundType;
    };
    icon?: string;              // Optional icon/emoji identifier
  }
  ```

### Card UI
- Horizontally swipeable card stack (like a carousel)
- Each card: rounded rectangle, warm background color, large text (min 18px)
- One instruction per card — no multi-step complexity
- Duration indicator at bottom of card (e.g., "~45 seconds")
- Tapping a card opens a full-screen activity view with a start button and optional audio playback

### MVP Content (~5 cards per stage)

**Stage 1 (3–6 months):**
1. "Hold baby upright. Bounce gently on beat 1. Say 'DOWN' each time."
2. "Rock baby side to side. Alternate left-right on each beat. Hum along."
3. "Pat baby's back gently in a steady rhythm. Count '1-2-1-2' out loud."
4. "Hold baby's hands. Gently pulse them together on the beat."
5. "Lay baby on your lap. Tap their feet alternately to the beat."

**Stage 2 (6–12 months):**
1. "Sit facing baby. Clap your hands together. Pause. Clap again. Wait for baby to mimic."
2. "Hold a rattle. Shake it on the beat. Offer it to baby between shakes."
3. "Play pat-a-cake. Your hands meet baby's hands on beat 1."
4. "Tap the floor together. Show baby, then wait for them to copy."
5. "Clap a simple pattern: clap-clap-pause. Repeat. Celebrate any response."

**Stage 3 (12–18 months):**
1. "Show baby the screen. Tap the big circle together. Celebrate each tap!"
2. "Give baby a wooden spoon. Tap a pot together on the beat."
3. "March in place together. Stomp on beat 1. Say 'STOMP!'"
4. "Clap a pattern. Pause. See if baby fills in the gap."
5. "Dance together! Hold hands and sway to the beat."

---

## Duet Tap Screen

### Layout
- Split screen: two large tap zones
  - **Left zone (parent):** labeled "You", colored with `babyTapZoneA` (blue)
  - **Right zone (baby/parent-guided):** labeled baby's name or "Baby", colored with `babyTapZoneB` (orange)
- Each zone: minimum 80px tap target, fills roughly half the screen
- Zones have large, rounded shapes (circles or rounded rectangles)

### Audio
- **Parent tap sound:** soft chime (`sounds.baby.chime`)
- **Baby tap sound:** soft bell (`sounds.baby.bell`)
- **Background beat:** optional steady pulse at configurable BPM (default 80, range 60–100)
  - Plays a soft tick sound on each beat
  - Adjustable via a small BPM stepper at the top of the screen

### Interactions
- Each tap on either zone:
  - Produces the zone's sound
  - Triggers a **ripple animation** emanating from the tap point (concentric circles expanding and fading)
  - Optional haptic feedback (gentle)
- **Celebration burst:** when both zones are tapped within 200ms of each other:
  - A burst animation plays (particles, stars, or expanding rings) centered between the two zones
  - A brief celebratory sound (soft sparkle or chime chord)
  - No score counter — just the joyful visual/audio reward

### Controls
- Small "X" or "Done" button in the top corner to exit
- BPM stepper (top center)
- No other controls — screen is maximally simple for baby interaction

### Screen Behavior
- Screen stays awake (`expo-keep-awake`)
- Device rotation locked to portrait (zones are side by side)
- Auto-session tracking: records start time on mount, end time on exit

---

## Baby Visualizer

### Layout
- **Full-screen** animated visual
- No controls visible except a small "X" button to exit (positioned in top corner, outside the baby's likely tap area)

### Visual Design
- High-contrast colors from the baby warm palette (see `contracts/design-tokens.md` Baby Mode Palette)
- Large geometric shapes: circles, stars, squares, triangles
- Shapes are positioned semi-randomly on screen (not overlapping)
- 3–5 shapes visible at any time

### Animation
- **On beat:** all shapes scale up (1.0 -> 1.3x) with a soft ease-out, then return to 1.0x
- **Between beats:** shapes gently float/drift with slow, smooth motion (not jerky)
- **Color cycling:** shapes slowly shift colors through the baby palette over time
- Background color: warm, soft (cream, pale peach, or light lavender from baby tokens)

### Audio
- Soft repeating tone on each beat (e.g., a marimba or xylophone note)
- BPM: slow (default 70, range 60–80)
- BPM adjustable via a hidden gesture (e.g., two-finger swipe) so baby can't accidentally change it

### Screen Behavior
- Screen stays awake
- Auto-session tracking: records start/end time

---

## Session Log

### Post-Activity Prompt
After any baby activity ends (Duet Tap exit, Visualizer exit, or activity card completion):
- Bottom sheet or modal prompt: "How did [baby name] respond?"
- Three options presented as large tappable cards with illustrations:
  - **Calm** — illustrated with a serene face, soft color
  - **Excited** — illustrated with an energetic face, bright color
  - **Disengaged** — illustrated with a sleepy face, muted color
- One tap saves the response and dismisses the prompt
- Dismissible without selecting (swipe down or tap outside) — no response recorded

### Session Record
```typescript
interface BabySession {
  id: string;
  activityType: 'duet-tap' | 'visualizer' | 'activity-card';
  activityId?: string;          // ID of the specific activity card, if applicable
  stageId: number;
  babyResponse: 'calm' | 'excited' | 'disengaged' | null;
  durationSeconds: number;      // Auto-tracked from activity start to end
  timestamp: string;            // ISO date string
}
```

### History View
- Chronological list of baby sessions, grouped by day
- Each entry shows: activity type icon, activity name, duration, baby response (illustrated icon), date/time
- Pull to refresh (for future Supabase sync)
- Summary at top: "This week: X sessions, Y minutes of rhythmic bonding"

---

## Warm UI Theme

When the Baby Mode tab is active, apply design token overrides to create a distinct, warm environment:

### Visual Overrides
- **Background color:** warm cream or soft peach (replacing the default app background)
- **Text size:** base font size increased by 2px; minimum 16px everywhere
- **Corner radius:** all rounded corners increased (e.g., 16px -> 24px for cards)
- **Tab bar tint:** baby palette accent color instead of the default app accent
- **Button styles:** softer shadows, warmer colors, no sharp edges
- **Icon style:** rounded, friendly (if custom icons are used)

### Implementation
- Use a `ThemeProvider` context or conditional design token set
- Theme switches on Baby Mode tab focus; reverts on leaving the tab
- Transition should be smooth (animated background color change over 200ms)

### Token Mapping (from contracts/design-tokens.md)
```
babyBackground:    '#FFF7ED'  // warm cream (app background in baby mode)
babySurface:       '#FFFFFF'  // baby mode cards
babyPrimary:       '#F97316'  // primary actions
babySecondary:     '#8B5CF6'  // secondary elements
babyAccent:        '#EC4899'  // celebrations, burst animations
babyTapZoneA:      '#3B82F6'  // parent tap zone (blue)
babyTapZoneB:      '#F97316'  // baby/guided tap zone (orange)
babyCelebration:   '#EAB308'  // burst animation on synced taps
babyTextPrimary:   '#1C1917'  // main text (dark on light)
babyTextSecondary: '#78716C'  // subdued text
```
**Always reference the canonical values in `contracts/design-tokens.md`.** These examples are for quick reference only.

---

## State

### Consumed
- `babyStore` — baby profile (name, birth date, stage), session history
- `audioStore` — for Duet Tap background beat and Visualizer beat sounds
- `settingsStore` — baby mode preferences (manual stage override, etc.)

### Written
- `babyStore.sessions` — array of `BabySession` records
- `babyStore.babyProfile` — updated if edited in baby settings

---

## Extension Points

### "Today's Activity" Card (P2)
- Slot for AI Baby Activity Generator
- When implemented: the featured card is generated by Claude based on baby's age, recent session history, and parent-provided context (available tools, etc.)
- MVP: curated — cycles through a pre-defined list or picks randomly from the current stage's cards

### Activity Cards Content Expansion
- Adding new activity cards is data-only: add entries to the stage's JSON array
- No code changes needed for content additions
- Post-MVP: community-contributed activities, content partnerships

### Stages 4–5 (Post-MVP)
- Stage 4 (18–36 months): Instrument mode — banging spoon, drum, tapping along
- Stage 5 (3–5 years): Simple game mode — stomp-clap polyrhythm games
- Implementation: add stage data files and any new interaction components needed
- The stage system is designed to accommodate this without architectural changes

### Lullaby Context Mode (P1)
- Familiar lullabies annotated with their underlying rhythmic feel
- Highlights how everyday songs have polyrhythmic elements
- Slot reserved on the Baby Mode home screen

---

## Edge Cases

- **No baby profile set:** if user selected "musician only" during onboarding, Baby Mode tab is hidden. If profile exists but birth date is missing, prompt to enter it before showing content.
- **Baby ages out of Stage 3 (>18 months):** show Stage 3 content with a banner: "More stages coming soon! Stage 3 activities are still great for [baby name]."
- **Baby too young (<3 months):** show a friendly message: "Baby mode starts at 3 months. In the meantime, play soft rhythms from the Practice tab while feeding or rocking [baby name]."
- **Session auto-end:** if the user leaves an activity screen (app backgrounding, navigation), auto-end the session and show the response prompt on return (or skip it if more than 5 minutes have passed).
- **Multiple babies:** MVP supports a single baby profile. Note: future extension could support multiple profiles with a profile switcher.

---

## Accessibility

- All tap targets minimum 80px (already enforced by baby design requirements)
- High contrast mode compatible (baby visualizer uses high-contrast colors by default)
- VoiceOver labels on all interactive elements
- Activity card instructions written at a 6th-grade reading level for accessibility
- Duet Tap sounds should be distinguishable by pitch, not just stereo position (for hearing-impaired users)
