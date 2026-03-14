interface UserProfile {
  /** UUID v4, generated on first launch */
  id: string;

  /** User-chosen display name, optional for MVP (anonymous auth) */
  displayName: string | null;

  /** Email address, null for anonymous users. Set when upgrading to email auth. */
  email: string | null;

  /** Primary role — determines tab visibility and content emphasis */
  role: 'musician' | 'parent' | 'both';

  /** Self-assessed rhythm experience level from onboarding */
  rhythmLevel: 'beginner' | 'intermediate' | 'advanced';

  /** Polyrhythm ratios selected during onboarding (e.g., ['3-2', '4-3']) */
  selectedRhythms: string[];

  /** Selected during onboarding, used by AI song recommender (P2) */
  genrePreferences: string[];

  /** ISO 8601 */
  createdAt: string;

  /** ISO 8601 */
  updatedAt: string;
}

export type { UserProfile };
