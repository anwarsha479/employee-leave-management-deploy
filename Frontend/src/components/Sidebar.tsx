import { useLocation, Link } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Button,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/auth.service";
import keycloak from "../keycloak";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

interface SidebarProps {
  collapsed: boolean;
}

function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const email = user?.email ?? "";
  const role = user?.role ?? "";

  const handleLogout = async () => {
    try {
      await logout();

      await keycloak.logout({
        redirectUri: window.location.origin,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      text: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
      roles: ["ADMIN", "EMPLOYEE"],
    },
    {
      text: "Departments",
      path: "/departments",
      icon: <ApartmentIcon />,
      roles: ["ADMIN"],
    },
    {
      text: "Employees",
      path: "/employees",
      icon: <PeopleIcon />,
      roles: ["ADMIN"],
    },
    {
      text: "Profile",
      path: "/profile",
      icon: <AccountCircleIcon />,
      roles: ["EMPLOYEE"],
    },
    {
      text: "Leaves",
      path: "/leaves",
      icon: <EventNoteIcon />,
      roles: ["ADMIN", "EMPLOYEE"],
    },
  ];

  return (
    <Box
      sx={{
        width: collapsed ? 80 : 260,
        height: "100vh",
        position: "sticky",
        top: 0,
        backgroundColor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflowX: "hidden",
      }}
    >
      {/* Profile Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          minHeight: 80,
          boxSizing: "border-box",
        }}
      >
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: role === "ADMIN" ? "primary.main" : "secondary.main",
            boxShadow:
              role === "ADMIN"
                ? "0 0 12px rgba(99, 102, 241, 0.4)"
                : "0 0 12px rgba(16, 185, 129, 0.4)",
          }}
        >
          {email ? email.charAt(0).toUpperCase() : "U"}
        </Avatar>
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                {role}
              </Typography>
              <Chip
                label={role === "ADMIN" ? "Admin" : "Staff"}
                size="small"
                color={role === "ADMIN" ? "primary" : "secondary"}
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  "& .MuiChip-label": { px: 0.8 },
                }}
              />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                display: "block",
                maxWidth: 160,
              }}
            >
              {email}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu List */}
      <List
        sx={{
          p: 2,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {menuItems
          .filter((item) => role && item.roles.includes(role))
          .map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: collapsed ? 1.5 : 2,
                    justifyContent: collapsed ? "center" : "flex-start",
                    backgroundColor: active
                      ? "rgba(99, 102, 241, 0.08)"
                      : "transparent",
                    color: active ? "primary.light" : "text.secondary",
                    borderLeft: active
                      ? "4px solid #6366f1"
                      : "4px solid transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      color: "text.primary",
                      "& .MuiListItemIcon-root": {
                        color: "primary.light",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 36,
                      color: active ? "primary.light" : "text.secondary",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontSize: "0.9rem",
                            fontWeight: active ? 600 : 500,
                          }}
                        >
                          {item.text}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>

      {/* Logout Action */}
      <Box sx={{ p: 2, pb: 4, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          variant="contained"
          onClick={handleLogout}
          sx={{
            backgroundColor: "rgba(230, 29, 29, 0.78)",
            color: "#ecececff",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            width: "100%",
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0 : 2,
            py: 1.2,
            borderRadius: 2,
            boxShadow: "none",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "#ec2121ff",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
              border: "1px solid #ef4444",
            },
          }}
        >
          <LogoutIcon sx={{ mr: collapsed ? 0 : 1.5, fontSize: 20 }} />
          {!collapsed && (
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
              Logout
            </Typography>
          )}
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;
