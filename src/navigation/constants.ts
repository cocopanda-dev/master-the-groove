import { colors } from '@design-system/tokens';

interface TabConfig {
  name: 'learn' | 'practice' | 'baby' | 'progress' | 'settings';
  label: string;
  iconActive: string;
  iconInactive: string;
}

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'learn',
    label: 'Learn',
    iconActive: 'music-note',
    iconInactive: 'music-note-outline',
  },
  {
    name: 'practice',
    label: 'Practice',
    iconActive: 'metronome',
    iconInactive: 'metronome',
  },
  {
    name: 'baby',
    label: 'Baby',
    iconActive: 'baby-face',
    iconInactive: 'baby-face-outline',
  },
  {
    name: 'progress',
    label: 'Progress',
    iconActive: 'chart-line',
    iconInactive: 'chart-line',
  },
  {
    name: 'settings',
    label: 'Settings',
    iconActive: 'cog',
    iconInactive: 'cog-outline',
  },
];

const TAB_BAR_STYLES = {
  height: 80,
  backgroundColor: colors.surface,
  activeTint: colors.primary,
  inactiveTint: colors.textSecondary,
  borderTopWidth: 1,
  borderTopColor: colors.border,
} as const;

const BABY_TAB_BAR_STYLES = {
  backgroundColor: colors.babySurface,
  activeTint: colors.babyPrimary,
  inactiveTint: colors.babyTextSecondary,
} as const;

const HEADER_STYLES = {
  headerShadowVisible: false,
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.primary,
  headerTitleStyle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '600' as const,
  },
} as const;

const TAB_ORDER_WITH_BABY = ['learn', 'practice', 'baby', 'progress', 'settings'] as const;
const TAB_ORDER_WITHOUT_BABY = ['learn', 'practice', 'progress', 'settings'] as const;

export type { TabConfig };

export {
  TAB_CONFIG,
  TAB_BAR_STYLES,
  BABY_TAB_BAR_STYLES,
  HEADER_STYLES,
  TAB_ORDER_WITH_BABY,
  TAB_ORDER_WITHOUT_BABY,
};
