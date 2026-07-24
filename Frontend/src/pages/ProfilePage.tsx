import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Divider,
  Grid,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { uploadProfileImage } from "../services/employee.service";
import Layout from "../components/Layout";
import {
  getProfile,
  updateProfile,
  changePassword,
  getProfileImageUrl,
} from "../services/profile.service";

function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();

        setProfile(response.data);
        setName(response.data.name);
        setPhone(response.data.phone);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file || !profile?.id) {
      return;
    }

    try {
      const response = await uploadProfileImage(profile.id, file);

      setProfile(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      if (!name.trim()) {
        alert("Name is required");
        return;
      }

      if (!/^\d{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit phone number");
        return;
      }

      await updateProfile({
        name,
        phone,
      });

      setProfile({
        ...profile,
        name,
        phone,
      });

      setEditing(false);
      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill all fields");
        return;
      }

      if (newPassword.length < 8) {
        alert("Password must be at least 8 characters");
        return;
      }

      if (currentPassword === newPassword) {
        alert("New password must be different from current password");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      await changePassword({
        currentPassword,
        newPassword,
      });

      alert("Password changed successfully");

      setPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      alert("Failed to change password");
    }
  };

  if (!profile) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Loading profile...</Typography>
        </Box>
      </Layout>
    );
  }

  const roleColor = profile.role === "ADMIN" ? "primary" : "secondary";

  const userInitials = profile.name
    ? profile.name
        .split(" ")
        .map((word: string) => word[0])
        .join("")
        .toUpperCase()
    : "ME";

  return (
    <Layout>
      <Box sx={{ maxWidth: 900, mx: "auto", py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
          My Profile
        </Typography>

        <Card
          sx={{
            background: "rgba(24,24,27,0.65)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            borderRadius: 4,
          }}
        >
          <Box
            sx={{
              height: 6,
              background: "linear-gradient(90deg,#6366f1 0%,#10b981 100%)",
              borderTopLeftRadius: "inherit",
              borderTopRightRadius: "inherit",
            }}
          />

          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                gap: 4,
                mb: 4,
                alignItems: {
                  xs: "center",
                  sm: "flex-start",
                },
              }}
            >
              <Avatar
                src={getProfileImageUrl(profile?.profileImage)}
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: "2rem",
                  fontWeight: 700,
                  bgcolor:
                    profile.role === "ADMIN"
                      ? "primary.main"
                      : "secondary.main",
                }}
              >
                {!profile?.profileImage && userInitials}
              </Avatar>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Button variant="outlined" component="label" size="small">
                  Upload Photo
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                  />
                </Button>
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  textAlign: {
                    xs: "center",
                    sm: "left",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: {
                      xs: "column",
                      sm: "row",
                    },
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  {editing ? (
                    <TextField
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      size="small"
                    />
                  ) : (
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      {profile.name}
                    </Typography>
                  )}

                  <Chip label={profile.role} color={roleColor} size="small" />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {profile.designation}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <FingerprintIcon />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Employee Code
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {profile.employeeCode}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <EmailIcon />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {profile.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <PhoneIcon />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phone Number
                    </Typography>

                    {editing ? (
                      <TextField
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        size="small"
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        {profile.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <BusinessIcon />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {profile.department}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <WorkIcon />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Designation
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {profile.designation}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <CalendarMonthIcon />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Joining Date
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {profile.joiningDate}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {editing ? (
                <>
                  <Button variant="contained" onClick={handleSave}>
                    Save
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      setName(profile.name);
                      setPhone(profile.phone);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
              <Button variant="outlined" onClick={() => setPasswordOpen(true)}>
                Change Password
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Dialog
        open={passwordOpen}
        onClose={() => {
          setPasswordOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Change Password</DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
          />

          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />

          <TextField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setPasswordOpen(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Cancel
          </Button>

          <Button variant="contained" onClick={handleChangePassword}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}

export default ProfilePage;
