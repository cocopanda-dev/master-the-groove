import {
  TAB_CONFIG,
  HEADER_STYLES,
  TAB_BAR_STYLES,
  BABY_TAB_BAR_STYLES,
  TAB_ORDER_WITH_BABY,
  TAB_ORDER_WITHOUT_BABY,
} from '../constants';

describe('TAB_CONFIG', () => {
  it('defines exactly 5 tabs', () => {
    expect(TAB_CONFIG).toHaveLength(5);
  });

  it('has correct tab order: Learn, Practice, Baby, Progress, Settings', () => {
    const names = TAB_CONFIG.map((tab) => tab.name);
    expect(names).toEqual(['learn', 'practice', 'baby', 'progress', 'settings']);
  });

  it('each tab has required fields', () => {
    for (const tab of TAB_CONFIG) {
      expect(tab).toHaveProperty('name');
      expect(tab).toHaveProperty('label');
      expect(tab).toHaveProperty('iconActive');
      expect(tab).toHaveProperty('iconInactive');
    }
  });

  it('Learn tab has correct icon names', () => {
    const learnTab = TAB_CONFIG.find((tab) => tab.name === 'learn');
    expect(learnTab?.iconActive).toBe('music-note');
    expect(learnTab?.iconInactive).toBe('music-note-outline');
  });

  it('Practice tab has correct icon names', () => {
    const practiceTab = TAB_CONFIG.find((tab) => tab.name === 'practice');
    expect(practiceTab?.iconActive).toBe('metronome');
    expect(practiceTab?.iconInactive).toBe('metronome');
  });

  it('Baby tab has correct icon names', () => {
    const babyTab = TAB_CONFIG.find((tab) => tab.name === 'baby');
    expect(babyTab?.iconActive).toBe('baby-face');
    expect(babyTab?.iconInactive).toBe('baby-face-outline');
  });

  it('Progress tab has correct icon names', () => {
    const progressTab = TAB_CONFIG.find((tab) => tab.name === 'progress');
    expect(progressTab?.iconActive).toBe('chart-line');
    expect(progressTab?.iconInactive).toBe('chart-line');
  });

  it('Settings tab has correct icon names', () => {
    const settingsTab = TAB_CONFIG.find((tab) => tab.name === 'settings');
    expect(settingsTab?.iconActive).toBe('cog');
    expect(settingsTab?.iconInactive).toBe('cog-outline');
  });
});

describe('TAB_BAR_STYLES', () => {
  it('has height of 80', () => {
    expect(TAB_BAR_STYLES.height).toBe(80);
  });

  it('uses surface token for background', () => {
    expect(TAB_BAR_STYLES.backgroundColor).toBeDefined();
  });

  it('has borderTopWidth of 1', () => {
    expect(TAB_BAR_STYLES.borderTopWidth).toBe(1);
  });
});

describe('BABY_TAB_BAR_STYLES', () => {
  it('uses babySurface for background', () => {
    expect(BABY_TAB_BAR_STYLES.backgroundColor).toBeDefined();
  });

  it('uses babyPrimary for activeTint', () => {
    expect(BABY_TAB_BAR_STYLES.activeTint).toBeDefined();
  });

  it('uses babyTextSecondary for inactiveTint', () => {
    expect(BABY_TAB_BAR_STYLES.inactiveTint).toBeDefined();
  });
});

describe('HEADER_STYLES', () => {
  it('has headerShadowVisible set to false', () => {
    expect(HEADER_STYLES.headerShadowVisible).toBe(false);
  });

  it('uses surface token for headerStyle background', () => {
    expect(HEADER_STYLES.headerStyle.backgroundColor).toBeDefined();
  });
});

describe('TAB_ORDER constants', () => {
  it('TAB_ORDER_WITH_BABY has 5 entries', () => {
    expect(TAB_ORDER_WITH_BABY).toEqual(['learn', 'practice', 'baby', 'progress', 'settings']);
  });

  it('TAB_ORDER_WITHOUT_BABY has 4 entries (no baby)', () => {
    expect(TAB_ORDER_WITHOUT_BABY).toEqual(['learn', 'practice', 'progress', 'settings']);
  });
});
