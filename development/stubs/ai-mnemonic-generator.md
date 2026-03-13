# AI Mnemonic Generator
**Phase:** P2
**Depends on:** Feel Internalization Lessons (step 3 — mnemonic card)

## What It Does
Lets users generate personalized mnemonics for any polyrhythm. Claude receives the polyrhythm's syllable pattern and the user's chosen theme preference (e.g., animals, food, sports, names), then returns 2-3 custom mnemonic options that fit the exact syllable count. Users can save their favorite to replace the default mnemonic in future lesson sessions.

## Interfaces
```typescript
interface MnemonicRequest {
  polyrhythmId: string;           // e.g. "3:2"
  syllablePattern: string;        // e.g. "NOT-DIFF-i-CULT-y"
  themePreference: string;        // e.g. "basketball", "food", "my dog's name"
}

interface MnemonicResponse {
  mnemonics: {
    text: string;                 // e.g. "Ste-pha-CUR-ry SHOOTS"
    syllableBreakdown: string[];  // ["Ste", "pha", "CUR", "ry", "SHOOTS"]
  }[];
}
```

## Extension Points
- **"Generate mine" button on mnemonic card in lesson step 3** — MVP lesson step 3 shows a static mnemonic card (e.g., "not difficult"). P2 adds a "Generate mine" button below the default card that opens a theme input field, fires the AI request, and displays 2-3 generated options as selectable cards.

## Data Shapes
```
user_mnemonics
  id              UUID PRIMARY KEY
  userId          UUID REFERENCES users(id)
  polyrhythmId    TEXT NOT NULL       -- e.g. "3:2"
  mnemonic        TEXT NOT NULL       -- the chosen mnemonic text
  theme           TEXT NOT NULL       -- theme used to generate it
  createdAt       TIMESTAMPTZ
```
