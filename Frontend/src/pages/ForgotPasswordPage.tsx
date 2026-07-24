import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/auth.service";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Container,
  Snackbar,
  Alert,
  Link,
  Avatar,
} from "@mui/material";

import HelpIcon from "@mui/icons-material/Help";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      await forgotPassword(email.trim());

      setSnackbarMessage("OTP sent to your email.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOtpSent(true);
      setCountdown(30);
      setCanResend(false);
    } catch (error: any) {
      console.error(error);

      setSnackbarMessage(
        error.response?.data?.message || "Failed to send OTP.",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setSnackbarMessage("Passwords do not match");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setResettingPassword(true);
      await resetPassword(email, otp, password);

      setSnackbarMessage("Password reset successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      console.error(error);

      setSnackbarMessage(
        error.response?.data?.message || "Invalid OTP or OTP expired",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setResettingPassword(false);
    }
  };
  useEffect(() => {
    if (!otpSent || canResend) {
      return;
    }

    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown((prev) => prev - 1);
      } else {
        setCountdown(0);
        setCanResend(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, otpSent, canResend]);

  return (
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
              bgcolor: "secondary.main",
              width: 56,
              height: 56,
              boxShadow: "0 0 20px rgba(16,185,129,0.5)",
            }}
          >
            <HelpIcon sx={{ fontSize: 32 }} />
          </Avatar>

          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 800,
              mt: 2,
              textAlign: "center",
              background: "linear-gradient(45deg,#818cf8 30%,#34d399 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Leave Management System
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Recover your account password
          </Typography>
        </Box>

        <Card
          sx={{
            background: "rgba(24,24,27,0.65)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Forgot Password
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your registered email address to receive an OTP.
            </Typography>

            <TextField
              fullWidth
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
              sx={{ mb: 2 }}
            />

            {!otpSent ? (
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSendOtp}
                disabled={sendingOtp}
              >
                {sendingOtp ? "Sending..." : "Send OTP"}
              </Button>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={{ mt: 3 }}
                />

                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={{ mt: 2 }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{ mt: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3 }}
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? "Resetting..." : "Reset Password"}
                </Button>
                <Box
                  sx={{
                    mt: 2,
                    textAlign: "center",
                  }}
                >
                  {canResend ? (
                    <Button
                      variant="text"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                    >
                      {sendingOtp ? "Sending..." : "Resend OTP"}
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Resend OTP in {countdown}s
                    </Typography>
                  )}
                </Box>
              </>
            )}

            <Box
              sx={{
                mt: 3,
                textAlign: "center",
              }}
            >
              <Link component={RouterLink} to="/" underline="hover">
                Back to Login
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbarSeverity}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ForgotPasswordPage;
