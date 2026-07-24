import { AppBar, Toolbar, IconButton, Typography, Box } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import { useThemeContext } from "../context/ThemeContext";

interface TopbarProps {
  toggleSidebar: () => void;
  collapsed: boolean;
}
function Topbar({ toggleSidebar, collapsed }: TopbarProps) {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
        minHeight: 80,
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          px: 4,
          minHeight: 79,
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleSidebar}
          edge="start"
          sx={{
            mr: 2,
            border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: 2,
            p: 1,
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor:
                mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            },
            "& svg": {
              fontSize: 28,
            },
          }}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>

        <Typography
          variant="h5"
          component="div"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: "0.5px",
            background:
              mode === "dark"
                ? "linear-gradient(45deg, #f4f4f5 30%, #a1a1aa 90%)"
                : "linear-gradient(45deg, #18181b 30%, #52525b 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: {
              xs: "none",
              sm: "block",
            },
          }}
        >
          Employee Leave Management System
        </Typography>

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: "0.5px",
            background:
              mode === "dark"
                ? "linear-gradient(45deg, #f4f4f5 30%, #a1a1aa 90%)"
                : "linear-gradient(45deg, #18181b 30%, #52525b 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: {
              xs: "block",
              sm: "none",
            },
          }}
        >
          Leave Management
        </Typography>

        <Box>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            sx={{
              border: `1px solid ${mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              borderRadius: 2,
              p: 1,
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.02)",
              },
            }}
          >
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
