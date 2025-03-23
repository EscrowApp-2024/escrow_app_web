// src/components/ThemeWrapper.tsx
"use client"; // Mark this as a Client Component

import { ThemeProvider } from '@mui/material/styles';
import  theme  from '../../lib/theme'; // Adjust the path if needed

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}