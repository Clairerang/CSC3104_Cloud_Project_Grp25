import { createTheme } from "@mui/material/styles";

// Align with admin-portal theme for consistency
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e",
      light: "#f73378",
      dark: "#9a0036",
    },
    success: {
      main: "#2e7d32",
    },
    warning: {
      main: "#ed6c02",
    },
    error: {
      main: "#d32f2f",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          paddingTop: 10,
          paddingBottom: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
