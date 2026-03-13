# Educator Tools / Class Mode
**Phase:** P3
**Depends on:** Navigation (new tab or mode toggle), Data Layer (multi-user support / Supabase auth)

## What It Does
Adds a full classroom management system for music educators. Teachers can create classes, generate join codes, assign specific polyrhythm homework with due dates and custom instructions, and view student progress dashboards showing session counts, feel states, and practice streaks. Students join a class via code, see their assigned work in a dedicated view, and their practice data flows to the teacher's dashboard automatically.

## Interfaces
```typescript
interface Classroom {
  id: string;
  teacherId: string;
  name: string;                           // e.g. "Rhythm 101 - Fall 2026"
  joinCode: string;                       // 6-character alphanumeric code
  createdAt: Date;
}

interface Assignment {
  id: string;
  classroomId: string;
  polyrhythmId: string;                   // e.g. "3:2"
  dueDate: Date;
  instructions: string;                   // teacher's custom instructions
  createdAt: Date;
}

interface StudentProgress {
  studentId: string;
  assignmentId: string;
  sessionsCompleted: number;
  currentFeelState: 'executing' | 'hearing' | 'feeling';
  lastPracticeDate: Date | null;
  disappearingBeatHighWater: number;      // highest stage reached
}
```

## Extension Points
- **New "Educator" tab or mode toggle in settings** — Teachers activate educator mode via Settings, which reveals a new "Classes" tab replacing or augmenting the existing tab bar. Students see an "I'm in a class" option in Settings to enter a join code.
- **Class management screens** — New screen stack: Create Class, Class Detail (student list + progress), Create Assignment, Assignment Detail.
- **Student dashboard** — Students see a "My Classes" section showing assigned work, due dates, and their own progress. Integrates with existing Progress tab data.

## Data Shapes
```
classrooms
  id              UUID PRIMARY KEY
  teacherId       UUID REFERENCES users(id)
  name            TEXT NOT NULL
  joinCode        TEXT NOT NULL UNIQUE
  createdAt       TIMESTAMPTZ

assignments
  id              UUID PRIMARY KEY
  classroomId     UUID REFERENCES classrooms(id)
  polyrhythmId    TEXT NOT NULL
  dueDate         TIMESTAMPTZ NOT NULL
  instructions    TEXT NOT NULL
  createdAt       TIMESTAMPTZ

classroom_members
  id              UUID PRIMARY KEY
  classroomId     UUID REFERENCES classrooms(id)
  userId          UUID REFERENCES users(id)
  role            TEXT NOT NULL          -- 'teacher' | 'student'
  joinedAt        TIMESTAMPTZ
  UNIQUE(classroomId, userId)

student_progress
  id              UUID PRIMARY KEY
  studentId       UUID REFERENCES users(id)
  assignmentId    UUID REFERENCES assignments(id)
  sessionsCompleted INTEGER DEFAULT 0
  currentFeelState  TEXT DEFAULT 'executing'
  lastPracticeDate  TIMESTAMPTZ NULLABLE
  disappearingBeatHighWater INTEGER DEFAULT 0
  UNIQUE(studentId, assignmentId)
```
