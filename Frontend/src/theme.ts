import { createTheme } from "@mui/material/styles";

// Generates the theme configuration for the application based on the mode (light/dark)
const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#6366f1",
        // Adjusted to Indigo 600 in light mode for higher contrast and better text visibility
        light: mode === "dark" ? "#818cf8" : "#4f46e5",
        dark: "#4f46e5",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#10b981",
        light: "#34d399",
        dark: "#059669",
        contrastText: "#ffffff",
      },

      ...(mode === "dark"
        ? {
            background: {
              default: "#09090b",
              paper: "#18181b",
            },
            text: {
              primary: "#f4f4f5",
              secondary: "#a1a1aa",
            },
            divider: "rgba(255,255,255,0.08)",
          }
        : {
            background: {
              default: "#f8fafc",
              paper: "#ffffff",
            },
            text: {
              primary: "#18181b",
              secondary: "#52525b",
            },
            divider: "rgba(0,0,0,0.08)",
          }),
    },

    typography: {
      fontFamily:
        '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },

    shape: {
      borderRadius: 12,
    },
    components: {
      // Global button hover transitions
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
        },
      },
      // Glassmorphism card styles that dynamically adjust to light/dark modes
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border:
              mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.08) !important"
                : "1px solid rgba(0, 0, 0, 0.08) !important",
            boxShadow:
              mode === "dark"
                ? "0 4px 20px rgba(0, 0, 0, 0.4) !important"
                : "0 4px 20px rgba(0, 0, 0, 0.05) !important",
            backgroundColor:
              mode === "dark"
                ? "rgba(24, 24, 27, 0.65) !important"
                : "rgba(255, 255, 255, 0.8) !important",
            backdropFilter: "blur(16px)",
          },
        },
      },
      // Table header overrides to force proper contrast in light/dark transitions
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor:
              mode === "dark" ? "#18181b !important" : "#ffffff !important",
            color:
              mode === "dark" ? "#f4f4f5 !important" : "#18181b !important",
            borderBottom:
              mode === "dark"
                ? "2px solid rgba(255,255,255,0.08) !important"
                : "2px solid rgba(0,0,0,0.08) !important",
          },
          body: {
            borderBottom:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.08) !important"
                : "1px solid rgba(0,0,0,0.08) !important",
          },
        },
      },
      // Inputs and browser autofill coloring compatibility updates
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          input: {
            "&:-webkit-autofill": {
              WebkitBoxShadow:
                mode === "dark"
                  ? "0 0 0 100px #18181b inset !important"
                  : "0 0 0 100px #f8fafc inset !important",
              WebkitTextFillColor:
                mode === "dark" ? "#f4f4f5 !important" : "#18181b !important",
              caretColor: mode === "dark" ? "#f4f4f5" : "#18181b",
              transition: "background-color 5000s ease-in-out 0s",
            },
          },
        },
      },
    },
  });

export default getTheme;
