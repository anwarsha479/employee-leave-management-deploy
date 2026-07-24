import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { login } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import keycloak from "../keycloak";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Container,
  Link,
  Avatar,
  ThemeProvider,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import getTheme from "../theme";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  useEffect(() => {
    const handleKeycloakCallback = async () => {
      const authenticated = await keycloak.init({
        checkLoginIframe: false,
      });

      if (authenticated && keycloak.token) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/keycloak-login`,
          {
            token: keycloak.token,
          },
          {
            withCredentials: true,
          },
        );

        await refreshUser();
        navigate("/dashboard");
      }
    };

    handleKeycloakCallback();
  }, []);

  const handleLogin = async () => {
    try {
      await login(email.trim(), password);
      await refreshUser();
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  const handleKeycloakLogin = async () => {
    await keycloak.login();
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const darkTheme = useMemo(() => getTheme("dark"), []);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 50%, #1e1b4b 0%, #09090b 100%)",
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                m: 1,
                bgcolor: "primary.main",
                width: 56,
                height: 56,
                boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 800,
                mt: 2,
                textAlign: "center",
                background: "linear-gradient(45deg, #818cf8 30%, #34d399 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Leave Management System
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Sign in to access your portal
            </Typography>
          </Box>

          <Card
            sx={{
              background: "rgba(24, 24, 27, 0.65)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.4)",
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                component="h2"
                variant="h5"
                sx={{ fontWeight: 600, mb: 3 }}
              >
                Login
              </Typography>

              <Box component="div">
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(9, 9, 11, 0.4)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "rgba(9, 9, 11, 0.6)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "rgba(9, 9, 11, 0.8)",
                      },
                    },
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px #18181b inset !important",
                      WebkitTextFillColor: "#f4f4f5 !important",
                      caretColor: "#f4f4f5",
                      borderRadius: "inherit",
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(9, 9, 11, 0.4)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "rgba(9, 9, 11, 0.6)",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "rgba(9, 9, 11, 0.8)",
                      },
                    },
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px #18181b inset !important",
                      WebkitTextFillColor: "#f4f4f5 !important",
                      caretColor: "#f4f4f5",
                      borderRadius: "inherit",
                    },
                  }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{ color: "rgba(255, 255, 255, 0.5)", mr: 0.5 }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleLogin}
                  sx={{
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    bgcolor: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  Sign In
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleKeycloakLogin}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  Login with Keycloak
                </Button>

                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    color="primary.light"
                    sx={{
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default LoginPage;
