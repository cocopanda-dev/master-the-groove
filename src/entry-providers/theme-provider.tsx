import React, { createContext, useContext } from 'react';
import { colors } from '@design-system';

type ThemeMode = 'default' | 'baby';

interface ThemeContextValue {
  readonly mode: ThemeMode;
  readonly colors: typeof colors;
}

const defaultTheme: ThemeContextValue = { mode: 'default', colors };

const ThemeContext = createContext<ThemeContextValue>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext.Provider value={defaultTheme}>
    {children}
  </ThemeContext.Provider>
);
