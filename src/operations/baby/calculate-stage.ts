// src/operations/baby/calculate-stage.ts
type BabyStage = 0 | 1 | 2 | 3 | 4 | 5;

export const calculateStageFromBirthDate = (
  birthDate: string,
  now: Date = new Date(),
): BabyStage => {
  const birth = new Date(birthDate);
  const months =
    (now.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - birth.getUTCMonth());

  if (months < 3) return 0;
  if (months < 6) return 1;
  if (months < 12) return 2;
  if (months < 18) return 3;
  if (months < 36) return 4;
  return 5;
};
