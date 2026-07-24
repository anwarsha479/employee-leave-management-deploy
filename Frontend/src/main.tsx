import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import getTheme from "./theme";
import { ThemeProviderWrapper, useThemeContext } from "./context/ThemeContext";

function AppTheme() {
  const { mode } = useThemeContext();

  return (
    <ThemeProvider theme={getTheme(mode as "light" | "dark")}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

//  keycloak
//   .init({
//     onLoad: "check-sso",
//     pkceMethod: "S256",
//     checkLoginIframe: false,
//   })
//   .then(() => {
//     ReactDOM.createRoot(
//       document.getElementById("root")!,
//     ).render(
//       <React.StrictMode>
//         <ThemeProviderWrapper>
//           <AuthProvider>
//             <AppTheme />
//           </AuthProvider>
//         </ThemeProviderWrapper>
//       </React.StrictMode>,
//     );
//   })
//   .catch((error) => {
//     console.error("Keycloak initialization failed:", error);
//   });
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProviderWrapper>
      <AuthProvider>
        <AppTheme />
      </AuthProvider>
    </ThemeProviderWrapper>
  </React.StrictMode>,
);
