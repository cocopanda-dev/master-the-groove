import type { FeelState } from '@types';
import { colors } from '@design-system/tokens/colors';

type FeelStateConfigEntry = {
  label: string;
  color: string;
  icon: 'circle-outline' | 'circle-half-full' | 'circle';
  description: string;
};

const FEEL_STATE_CONFIG: Record<FeelState, FeelStateConfigEntry> = {
  executing: {
    label: 'Executing',
    color: colors.textMuted,
    icon: 'circle-outline',
    description: "I'm following the pattern but it doesn't feel natural yet",
  },
  hearing: {
    label: 'Hearing',
    color: colors.warning,
    icon: 'circle-half-full',
    description: 'I can hear the rhythm in my head even without the audio',
  },
  feeling: {
    label: 'Feeling',
    color: colors.success,
    icon: 'circle',
    description: "The rhythm lives in me -- I don't have to think about it",
  },
} as const;

const FEEL_STATE_ORDER: FeelState[] = ['executing', 'hearing', 'feeling'];

const SESSION_MODE_LABELS: Record<string, string> = {
  'free-play': 'Free Play',
  lesson: 'Lesson',
  'disappearing-beat': 'Disappearing Beat',
  'duet-tap': 'Duet Tap',
};

const SESSION_MODE_ICONS: Record<string, string> = {
  'free-play': 'play-circle',
  lesson: 'book-open-variant',
  'disappearing-beat': 'volume-off',
  'duet-tap': 'hand-clap',
};

export { FEEL_STATE_CONFIG, FEEL_STATE_ORDER, SESSION_MODE_LABELS, SESSION_MODE_ICONS };
export type { FeelStateConfigEntry };
