import { useState } from "react";
import type { ReactNode } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Sidebar collapsed={collapsed} />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // Prevent flex item overflow
        }}
      >
        <Topbar toggleSidebar={toggleSidebar} collapsed={collapsed} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 4 },
            backgroundColor: "background.default",
            overflowX: "hidden",
            minWidth: 0,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
export default Layout;
