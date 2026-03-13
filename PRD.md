# GrooveCore — Product Requirements Document

**Version:** 0.1 (Draft)  
**Author:** Chao  
**Last Updated:** March 2026  
**Platform:** iOS & Android (Expo / React Native)  
**Status:** Pre-MVP

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Competitive Landscape](#4-competitive-landscape)
5. [Core Philosophy](#5-core-philosophy)
6. [Feature Scope](#6-feature-scope)
7. [Feature Specifications](#7-feature-specifications)
8. [AI Integration](#8-ai-integration)
9. [Baby & Toddler Mode](#9-baby--toddler-mode)
10. [App Architecture & Screens](#10-app-architecture--screens)
11. [Tech Stack](#11-tech-stack)
12. [MVP Scope](#12-mvp-scope)
13. [Roadmap](#13-roadmap)
14. [Success Metrics](#14-success-metrics)
15. [Open Questions](#15-open-questions)

---

## 1. Product Vision

> **"Go from knowing the pattern to feeling the groove."**

GrooveCore is a feel-first rhythm training app for musicians and parents raising rhythmically aware children. Unlike existing metronome and polyrhythm apps that train mechanical execution, GrooveCore trains **internal rhythmic feel** — the embodied sense of a rhythm that lets you hold it in your body without thinking.

It does this through guided internalization lessons, body-based exercises, AI coaching, and a dedicated parent-baby bonding mode — all wrapped in a progressive, game-like learning system.

---

## 2. Problem Statement

**For musicians:** Existing polyrhythm apps (Polyrhythm Hero, Poly Metronome, Polyrhythm Explorer) are fancy metronomes. They play a pattern and ask you to follow it. After weeks of practice, many users can execute the rhythm mechanically but report they still don't _feel_ it — they're chasing the pattern, not owning it. No app addresses the gap between execution and internalization.

**For parents:** There are zero apps that guide parents through rhythm training with babies and toddlers. Early musical education research consistently shows that rhythmic exposure in the first 3 years builds foundational musicality, but parents have no practical, structured tool to do this. Baby music apps exist (Spotify, lullaby apps), but none are interactive, instructional, or polyrhythm-aware.

**The shared gap:** No app connects _why this rhythm feels a certain way_ to _real music you already know_ to _your specific body and learning style_. That context is what builds genuine feel.

---

## 3. Target Users

### Primary: Adult Musicians (Ages 18–45)

- Drummers, pianists, guitarists seeking to level up rhythmic independence
- Intermediate players who can read rhythm but struggle with feel
- Self-taught musicians who missed foundational rhythmic training
- Music students looking for structured supplemental practice

**Pain points:**

- Apps play the pattern but don't teach _how to internalize it_
- No connection to real music context ("where do I hear this?")
- Generic progression — no adaptation to where they personally struggle

---

### Secondary: Parents with Young Children (Ages 28–42)

- Parents interested in early childhood musical development
- No musical training themselves but want to give their child a head start
- Looking for structured, age-appropriate activities, not just background music

**Pain points:**

- No practical guidance on how to do rhythm activities with a baby
- Don't know what's developmentally appropriate at each age
- Need the app to be as much about the parent-child interaction as the sound

---

### Tertiary: Music Educators

- Private drum/piano teachers looking for student homework tools
- Classroom music teachers seeking supplemental rhythm curriculum

---

## 4. Competitive Landscape

| App                         | Strengths                          | Gaps                                             |
| --------------------------- | ---------------------------------- | ------------------------------------------------ |
| **Polyrhythm Hero**         | Game feel, engaging                | No instruction, pure execution, no feel training |
| **Poly Metronome**          | Precise, feature-rich              | No pedagogy, purely a tool                       |
| **Polyrhythm Explorer**     | Has written guides + video         | Still visualization-first, no AI, no baby mode   |
| **Complete Rhythm Trainer** | Progressive curriculum, 252 drills | No polyrhythm feel focus, no AI, no baby mode    |
| **PolyNome**                | Deep features, pro-level           | Too complex for beginners, no feel coaching      |

**GrooveCore's differentiator:** The only app that teaches _how to feel_ a rhythm, not just _how to execute_ it — with AI coaching, real music context, and a mode built for parent-baby learning.

---

## 5. Core Philosophy

Every feature in GrooveCore is evaluated against one question:

> **Does this move the learner from mechanical following → internal hearing → embodied feel?**

This creates three design principles:

1. **Feel over accuracy** — The goal is groove internalization, not millisecond precision. Feedback should reflect feel quality, not just timing error.

2. **Body before fingers** — Before any instrument practice, the rhythm should live in the voice, feet, or hands. Singing, walking, and clapping come first.

3. **Context before abstraction** — Every rhythm should be introduced through real music the learner recognizes, not as a math problem.

---

## 6. Feature Scope

### Feature Tiers

| Priority | Feature Area                             |
| -------- | ---------------------------------------- |
| P0 (MVP) | Core polyrhythm player with stereo split |
| P0 (MVP) | Feel internalization lessons (3:2, 4:3)  |
| P0 (MVP) | Disappearing Beat mode                   |
| P0 (MVP) | Baby Mode — first pass                   |
| P1       | AI Vocal Coach (mic-based)               |
| P1       | AI Stuck Coach (conversational)          |
| P1       | Body Layer Mode                          |
| P1       | Composite Shape Visualizer               |
| P1       | Real Music Context library               |
| P2       | AI Song Recommender                      |
| P2       | AI Baby Activity Generator               |
| P2       | AI Progress Narrator                     |
| P2       | AI Mnemonic Generator                    |
| P2       | Adaptive Tempo Coach                     |
| P3       | Educator tools / class mode              |
| P3       | Social / practice streaks                |

---

## 7. Feature Specifications

### 7.1 Core Polyrhythm Player

The foundation of the app. A precise, clean polyrhythm player that does the basics better than competitors.

**Requirements:**

- Support ratios from 2:1 up to 9:8
- Independent volume control per layer
- **Stereo split mode:** Left ear = rhythm A, right ear = rhythm B (headphones). This is a frequently requested feature missing from every competitor.
- Sound library: clicks, woodblock, clave, djembe, drum kit, handpan (soft tones for baby mode)
- Tap tempo input
- BPM range: 20–240
- Visual: circular/radial beat indicator (more intuitive than linear for groove feel)
- Screen stays active during playback

**What makes it different from competitors:**
The stereo split feature alone is a meaningful differentiator — it lets players train each hand to an independent ear channel, which mirrors real practice.

---

### 7.2 Feel Internalization Lessons

The core pedagogical feature. A structured lesson format that teaches _how to feel_ a polyrhythm, not just hear it.

**Lesson structure for each polyrhythm (e.g. 3:2):**

1. **Hear it in music first** — Short embedded audio clip or YouTube link showing the rhythm in a real song
2. **Understand the shape** — Short visual explanation of what makes this rhythm feel the way it does ("3:2 has a slight lean, like a sway")
3. **Learn the mnemonic** — The syllable/word trick ("not diff-i-cult", or AI-generated custom one)
4. **Sing the 3 while tapping the 2** — Microphone-guided exercise (P1: with AI feedback, MVP: without)
5. **Walk + clap exercise** — On-screen prompt: "Walk in 2, clap in 3"
6. **Both hands** — Standard tap interface, but now with context
7. **Disappearing Beat challenge** — One layer fades out, you hold it internally

**Available lessons at MVP:**

- 3:2 (clave, Afro-Cuban feel)
- 4:3 (classical hemiola, jazz feel)
- 2:3 (reverse clave)

**Lesson completion:**

- Unlocks a "feel badge" for that polyrhythm
- Logs to practice journal

---

### 7.3 Disappearing Beat Mode

One of the most powerful training features. Trains the internal pulse — the thing that separates musicians with feel from those without.

**Flow:**

1. Start: both layers fully audible
2. Stage 1: Layer A fades to 50% volume — user must mentally "fill in" the gaps
3. Stage 2: Layer A mutes completely — user holds it internally while hearing Layer B
4. Stage 3: Both layers mute — user plays/sings against pure internal pulse for 8 bars
5. Both layers return on beat 1 — did you land together?

**Feedback:** Visual indicator shows how close to beat 1 the user's tap was when the layers return. Not pass/fail — shows drift direction.

**Difficulty settings:** Choose which layer disappears first, how long each stage lasts, how many cycles.

---

### 7.4 Composite Shape Visualizer

A visualization that shows the combined pattern as a single groove entity — trains the learner to hear the two rhythms as one unified feel.

**Design:**

- Circular (radial) layout — one full revolution = one combined cycle
- Both rhythms shown as dots on the circle
- Shared beats (beat 1) pulse with a distinct color
- Animation breathes with the tempo — not mechanical
- "Composite mode" toggles off the individual layer colors and shows only the combined hit pattern

**Why this matters:** Users who see two separate lines tend to manage them separately in their head. A circular unified view encourages hearing the composite groove as one thing.

---

### 7.5 Body Layer Mode

Trains rhythmic independence by assigning each rhythm to a different body part — the way professional percussionists and drummers actually learn.

**Setup screen:**

- "Assign 3 to: voice / clapping / right hand / foot stomp"
- "Assign 2 to: voice / clapping / left hand / foot stomp"

**Session flow:**

- On-screen animated cues show which body part to use and when
- App tracks taps for the "hands" assignments
- Voice assignments use mic (with AI in P1, without in MVP)
- Foot stomp uses device accelerometer

**Presets:**

- Drummer: hihat + kick
- Pianist: right hand + left hand
- Vocalist: hum + tap
- Baby: parent claps + baby bounce (see Baby Mode)

---

### 7.6 Real Music Context Library

Every polyrhythm in the app is annotated with 3–5 real song examples, with specific timestamps and listening instructions.

**Entry format for each song:**

- Song title + artist
- Genre + cultural origin
- "Listen for: [specific, plain-language description of where the rhythm lives]"
- Timestamp: "At 0:42, the bass holds the 2 while the melody rides the 3"
- Link to Spotify / YouTube

**Rationale:** Internal feel almost always comes from ear exposure to music you love. Connecting the abstract pattern to a song you know collapses the gap between theory and feel dramatically.

**MVP examples for 3:2:**

- "Afro Blue" – Mongo Santamaría (and the John Coltrane version)
- "La Bamba" — traditional son jarocho
- "Signature" – Radiohead (Tom Yorke's voice vs drums)
- Any Chopin Nocturne in 3/4 — left vs right hand

---

### 7.7 Practice Journal & Feel Log

**Session summary (auto-generated after each session):**

- Polyrhythm practiced
- Duration
- Tempo range covered
- Disappearing Beat stage reached
- One AI-generated observation (P2)

**Feel Status per polyrhythm:**
Three states: `Executing` → `Hearing` → `Feeling`

Users self-report their feel state after each session with a one-tap prompt:

> "How did 3:2 feel today?"
> [Still mechanical] [I could hear it] [I felt it in my body]

This self-reflection loop is as important as the practice itself.

**Weekly overview:**

- Streaks, total practice time, polyrhythms visited
- Which rhythms have moved from Executing → Feeling

---

## 8. AI Integration

All AI features use the Anthropic Claude API (claude-sonnet). Calls are lightweight, targeted, and triggered by specific user moments — not running continuously. The app passes session context (current polyrhythm, tempo, user stage, self-reported feel state) with each call to make responses highly personalized.

---

### 8.1 AI Vocal Coach (P1)

**Trigger:** User enters "Sing & Tap" mode in a lesson.

**Flow:**

1. App plays one layer (e.g., the 2)
2. User sings or hums the other layer (the 3) into the mic
3. App records 4–8 bars of audio
4. Audio is analyzed for rhythmic accuracy (onset detection via on-device audio processing)
5. Claude receives: current polyrhythm, user's hit timing data, session tempo
6. Claude returns: a short (2–3 sentence) coaching note

**Example AI response:**

> "Your triplets are landing well on beat 1, but you're rushing through the 2nd and 3rd subdivisions. Try exhaling on each triplet — let your breath pace the feel."

**Implementation note:** Onset detection runs locally (no audio sent to server). Only timing data sent to Claude API.

---

### 8.2 AI "I'm Stuck" Coach (P1)

**Trigger:** User taps a "Help" button during any lesson or free practice session.

**Flow:**

1. Claude receives: current polyrhythm, which mode user is in, how long they've been at this stage, their self-reported feel state
2. App asks 1 quick clarifying question: "Are you losing the [3] or the [2]?"
3. User taps their answer
4. Claude returns: a personalized micro-lesson (3–5 steps, specific to their situation)

**Example AI response (user losing the 3):**

> "When you lose the 3, it usually means the 2 is pulling you into its grid. Try this: stop playing both. Just sing the 3 out loud — 'tri-po-let, tri-po-let' — for 30 seconds without any backing. Let it become physical before you add the 2 back."

**Cost:** ~300–400 tokens per interaction. Very cheap, very high perceived value.

---

### 8.3 AI Song Recommender (P2)

**Trigger:** User taps "Hear this in real music" from any polyrhythm page.

**Flow:**

1. Claude receives: polyrhythm ratio, user's genre preferences (set in onboarding), skill level
2. Claude returns: 3–4 song recommendations with specific listening instructions

**Personalization example:**

- If user likes hip-hop: suggest J Dilla tracks with 3:2 feel
- If user likes classical: suggest Chopin or Brahms
- If user likes West African music: direct djembe ensemble recordings

---

### 8.4 AI Mnemonic Generator (P2)

**Trigger:** User taps "Generate my mnemonic" in lesson intro.

**Flow:**

1. Claude receives: polyrhythm syllable pattern + user's stated theme preference (animals, food, sports, names, etc.)
2. Claude returns: 2–3 custom mnemonic options that fit the exact syllable count

**Examples for 3:2:**

> - (Basketball fan): "Ste-pha-Cur-ry shoots"
> - (Food lover): "Pass the ri-cot-ta"
> - (Custom name): "Alex loves to dance"

---

### 8.5 AI Progress Narrator (P2)

**Trigger:** Auto-generated weekly summary notification, or user opens "My Progress" tab.

**Flow:**

1. Claude receives: last 7 days of session data (polyrhythms, durations, feel states, Disappearing Beat stages reached, tempo ranges)
2. Claude returns: a short paragraph narrative — like a coach checking in

**Example:**

> "This week you practiced 3:2 four times. You've moved from Executing to Hearing — your feel is stabilizing around 72 BPM. You tend to lose it in Disappearing Beat Stage 2. Next session, try slowing to 60 BPM and singing the 3 out loud during the mute phase before relying on internal feel alone."

---

### 8.6 AI Baby Activity Generator (P2)

**Trigger:** From Baby Mode home screen.

**Flow:**

1. Parent inputs: baby's age, what's available nearby (drum, spoons, clapping only, etc.)
2. Claude receives: age, tools, which polyrhythm to introduce, session duration preference
3. Claude returns: a complete 2–3 minute activity plan, step by step

**Example (10 months, wooden spoon):**

> "1. Sit baby in your lap facing away. Hold the spoon together. 2. Tap a slow, steady beat on a pot — count 1-2-1-2 out loud. 3. After 30 seconds, start humming 'tri-po-let' over the taps. 4. Guide baby's hand to tap on 1 only. 5. Make eye contact and smile on every beat 1 — social reinforcement deepens the rhythmic imprint."

---

## 9. Baby & Toddler Mode

A fully separate experience within the app — not a stripped-down version of the adult mode, but a redesigned flow for the parent-child pair as the unit of use.

### 9.1 Design Principles for Baby Mode

- **The parent is the primary user** — the baby is the experience
- **Sessions are under 3 minutes** — baby attention spans are short
- **Multimodal + social** — combines movement, sound, touch, and eye contact
- **Parent guidance is explicit** — every screen tells the parent exactly what to do
- **Visuals delight the baby** — high contrast, large shapes, warm colors, gentle animations
- **No scoring, no fail states** — pure positive reinforcement

---

### 9.2 Age-Stage Progression

| Stage   | Age          | Mode               | Focus                                                       |
| ------- | ------------ | ------------------ | ----------------------------------------------------------- |
| Stage 0 | 0–3 months   | Passive listening  | Expose to rhythmic patterns while feeding/rocking           |
| Stage 1 | 3–6 months   | Parent bounce mode | Parent moves baby to the beat with on-screen cues           |
| Stage 2 | 6–12 months  | Pat-a-cake mode    | Simple call-response clapping activities                    |
| Stage 3 | 12–18 months | Tap mode           | Baby taps oversized on-screen targets                       |
| Stage 4 | 18–36 months | Instrument mode    | Banging spoon, drum, or tapping along                       |
| Stage 5 | 3–5 years    | Simple game mode   | Stomp-clap polyrhythm games, stomping the 2, clapping the 3 |

App detects current stage from age set in profile. Can be manually overridden.

---

### 9.3 Core Baby Mode Features

**Parent Activity Cards**

- Swipeable cards with one instruction each
- Large font, simple language, illustrated
- Example: "Hold baby upright. Bounce gently on beat 1. Say 'DOWN' each time."
- Each card is a separate micro-activity, each 30–60 seconds

**Duet Tap Mode**

- Two large tap zones on screen — one side per person
- Parent taps one rhythm, guides baby's hand on the other
- Each tap produces a distinct, pleasant sound and animation
- Visual celebration when both taps land near the same beat

**Lullaby Context Mode**

- Familiar lullabies (cross-cultural) annotated with their underlying rhythmic feel
- Highlights: "This song has a 3:2 feel — notice how your rocking naturally follows it"
- Encourages parents to see everyday songs as rhythmic training moments

**Baby Visualizer**

- Full-screen animated visual that pulses with the rhythm
- High-contrast colors, large shapes, gentle motion
- Optional: uses device camera to show baby's face while the visual plays in background (parent-facing camera)

**Session Log**

- After each session: log how baby responded (calm, excited, disengaged)
- Weekly summary: "You did 4 rhythm sessions with your baby this week — that's 12 minutes of rhythmic bonding"
- Milestone framing: "At 8–10 months most babies begin anticipating the beat — watch for a head bob or bounce before a beat lands"

---

### 9.4 AI Baby Activity Generator (see Section 8.6)

Generates on-demand, custom activities based on baby's current age and whatever tools the parent has nearby.

---

## 10. App Architecture & Screens

### Navigation Structure

```
Tab Bar
├── 🎵 Learn          (lessons + guided paths)
├── 🥁 Practice       (free play + all tools)
├── 👶 Baby Mode      (parent-child flow)
├── 📈 Progress       (journal + feel log)
└── ⚙️  Settings
```

---

### Screen Map

**Onboarding (first launch)**

- Screen 1: "What do you want to feel?" — select polyrhythms of interest
- Screen 2: Background — musician / parent / both
- Screen 3: Genre preferences (for AI song recommender)
- Screen 4: Baby age input (if parent selected)

**Learn Tab**

- Polyrhythm Library: grid of all available ratios, with feel-state badges
- Lesson Detail: full lesson flow (see 7.2)
- Real Music Context: song examples per rhythm
- Mnemonic Card: word tricks, with "Generate mine" button (AI)

**Practice Tab**

- Core Player: stereo split, sound selection, tempo, visual mode
- Body Layer Mode: body part assignment + animated cues
- Disappearing Beat Mode: staged mute challenge
- Sing & Tap Mode: microphone input exercise
- Composite Visualizer: unified groove view

**Baby Mode Tab**

- Stage overview (current stage + what's next)
- Today's Activity (AI-generated or curated)
- Duet Tap screen
- Baby Visualizer (full-screen)
- Lullaby Library
- Session Log

**Progress Tab**

- Feel Status dashboard (Executing / Hearing / Feeling per rhythm)
- Weekly summary (AI-generated narrative)
- Session history
- Practice streaks

---

## 11. Tech Stack

| Layer                | Choice                                                      | Rationale                                               |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| Framework            | Expo (React Native)                                         | Cross-platform, already Chao's stack for Cook Assistant |
| Audio Engine         | `expo-av` + `react-native-sound`                            | Precise playback control                                |
| Mic / Audio Analysis | `expo-audio` + Web Audio API (web) / native module (mobile) | Onset detection for Sing & Tap                          |
| Animations           | `react-native-reanimated` + `react-native-skia`             | Smooth circular visualizer                              |
| AI                   | Anthropic Claude API (`claude-sonnet-4`)                    | Targeted, lightweight calls                             |
| Backend              | Supabase (auth + session logs)                              | Fast to ship, scales fine for this use case             |
| State                | Zustand                                                     | Lightweight, fits Expo well                             |
| Navigation           | Expo Router                                                 | File-based, clean                                       |

---

## 12. MVP Scope

The MVP proves the core differentiation: **feel-first instruction beats pattern execution**.

### MVP Includes

**Core Player**

- 3:2 and 4:3 polyrhythms only
- Stereo split mode (headphones)
- 3 sounds: click, clave, woodblock
- BPM: 40–160

**Feel Internalization Lesson (3:2 only)**

- Full lesson flow: music context → mnemonic → sing exercise (no AI yet) → both hands → Disappearing Beat
- Mnemonic display (static, not AI-generated yet)

**Disappearing Beat Mode**

- 3 stages (50% → 0% → both off)
- Basic drift feedback on return

**Baby Mode (Stage 1–3 only)**

- Activity cards for 3–12 months
- Duet Tap screen
- Baby Visualizer
- Session log (manual)

**Progress**

- Feel status self-report (3 states)
- Session history list

### MVP Excludes (post-MVP)

- AI features (all)
- Body Layer Mode
- Composite Shape Visualizer
- Real Music Context library
- Sing & Tap with mic detection
- Age stages 4–5 in baby mode
- Educator tools

---

## 13. Roadmap

### Phase 1 — MVP (Weeks 1–8)

- Core player with stereo split
- 3:2 feel lesson
- Disappearing Beat Mode
- Baby Mode Stage 1–3
- Basic progress tracking

### Phase 2 — Feel Depth (Weeks 9–16)

- AI Vocal Coach (Sing & Tap with mic)
- AI "I'm Stuck" Coach
- Body Layer Mode
- Composite Shape Visualizer
- Expand to 6 polyrhythm ratios
- Real Music Context library (curated)

### Phase 3 — Personalization (Weeks 17–24)

- AI Song Recommender
- AI Mnemonic Generator
- AI Progress Narrator
- AI Baby Activity Generator
- Adaptive Tempo Coach
- Baby Mode Stage 4–5

### Phase 4 — Community & Growth (Months 7–12)

- Practice streaks + social layer
- Educator/class mode
- User-created lesson sharing
- 3-way polyrhythm support (e.g. 3:4:5)

---

## 14. Success Metrics

### Engagement

- D7 retention ≥ 30% (industry avg for music apps: ~20%)
- Average session length ≥ 6 minutes
- Sessions per week per active user ≥ 3

### Learning Outcomes

- % of users who reach "Feeling" state on 3:2 within 14 days
- Disappearing Beat Mode completion rate (reaching Stage 3)

### Baby Mode

- % of parent users who complete 5+ baby sessions
- Baby mode session length (target: 2–4 min)

### AI Features (P1+)

- AI "I'm Stuck" activation rate per session
- Vocal Coach session completion rate
- User-reported helpfulness rating for AI coach responses

### Product Health

- App Store rating ≥ 4.5
- Lesson completion rate ≥ 60%
- AI cost per active user per month < $0.10

---

## 15. Open Questions

1. **Mic sensitivity and onset detection accuracy** — How reliably can we detect rhythmic taps and vocal onsets on a wide range of devices? May need calibration step.

2. **Audio latency** — React Native / Expo audio has known latency issues on some Android devices. Need to validate that the core player feels tight enough. May need to evaluate native audio modules.

3. **Stereo split and hearing safety** — Should the app include a volume warning when stereo split mode is activated? Especially relevant for baby mode.

4. **Baby mode content moderation** — AI-generated baby activities need guardrails. Should run through a safety filter before displaying to ensure no physically unsafe activity suggestions.

5. **Monetization** — Freemium (free core player, premium lessons + AI) vs one-time purchase vs subscription? Given the baby angle, consider family plan pricing.

6. **Content licensing** — For Real Music Context, embedding audio clips requires licensing. MVP should use YouTube links instead. Long term, explore licensing short clips or partnering with a music streaming API.

7. **Localization** — Polyrhythm training has deep roots in non-Western music. Should the app launch in English only, or consider early localization for West African, Latin American, or East Asian markets where polyrhythm culture runs deep?

---

_End of Document — GrooveCore PRD v0.1_
