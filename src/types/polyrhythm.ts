interface PolyrhythmRatio {
  /** Unique identifier, e.g. "3-2" */
  id: string;

  /** Numerator of the ratio (the "A" layer) */
  ratioA: number;

  /** Denominator of the ratio (the "B" layer) */
  ratioB: number;

  /** Compact display string, e.g. "3:2" */
  name: string;

  /** Human-readable name, e.g. "Three against Two" */
  displayName: string;

  /** Cultural/musical origin, e.g. "Afro-Cuban clave" */
  culturalOrigin: string;

  /** Memory aid phrase, e.g. "not diff-i-cult" for 3:2 */
  mnemonic: string;
}

/**
 * Polyrhythm ratios available at MVP.
 * Additional ratios added in later phases.
 */
const MVP_RATIOS: PolyrhythmRatio[] = [
  {
    id: '3-2',
    ratioA: 3,
    ratioB: 2,
    name: '3:2',
    displayName: 'Three against Two',
    culturalOrigin: 'Afro-Cuban clave',
    mnemonic: 'not diff-i-cult',
  },
  {
    id: '4-3',
    ratioA: 4,
    ratioB: 3,
    name: '4:3',
    displayName: 'Four against Three',
    culturalOrigin: 'Classical hemiola / Jazz',
    mnemonic: 'pass the bread and but-ter',
  },
  {
    id: '2-3',
    ratioA: 2,
    ratioB: 3,
    name: '2:3',
    displayName: 'Two against Three (reverse clave)',
    culturalOrigin: 'Afro-Cuban reverse clave',
    mnemonic: 'cold cup of tea',
  },
];

export type { PolyrhythmRatio };
export { MVP_RATIOS };
