// lib/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1A3C34', // --primary-dark-green
    },
    secondary: {
      main: '#FFFFFF', // --secondary-white
    },
    text: {
      primary: '#4A4A4A', // --text-gray
      secondary: '#6B7280', // A lighter shade for secondary text
    },
    background: {
      default: '#FFFFFF', // --secondary-white
      paper: '#FFFFFF',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#14352B', // --button-hover
          },
          '&:active': {
            backgroundColor: '#102520', // --button-active
          },
          '&:focus': {
            boxShadow: '0 0 0 3px rgba(26, 60, 52, 0.2)',
          },
        },
      },
    },
  },
});

// Dark mode theme
const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#2E5D53', // --primary-dark-green (dark mode)
    },
    secondary: {
      main: '#0a0a0a', // --background (dark mode)
    },
    text: {
      primary: '#B0B0B0', // --text-gray (dark mode)
      secondary: '#9CA3AF',
    },
    background: {
      default: '#0a0a0a',
      paper: '#0a0a0a',
    },
  },
});

export default theme;