import React, { useEffect, useState } from 'react';
import { initI18n } from '@libs/localization';

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return <>{children}</>;
};
