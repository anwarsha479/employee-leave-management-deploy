import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LeaveStatusChart from "../components/LeaveStatusChart";
import {
  getDashboardStats,
  getEmployeeDashboardStats,
} from "../services/dashboard.service";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import DepartmentChart from "../components/DepartmentChart";
import { getEmployeesByDepartment } from "../services/dashboard.service";

interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  totalLeaves: number;
  pendingLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
}

interface EmployeeDashboardStats {
  appliedLeaves: number;
  approvedLeaves: number;
  rejectedLeaves: number;
  remainingLeaves: number;
}

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const role = user?.role;
  if (!user) {
    return null;
  }

  const [stats, setStats] = useState<
    DashboardStats | EmployeeDashboardStats | null
  >(null);

  const [departmentData, setDepartmentData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response =
          role === "ADMIN"
            ? await getDashboardStats()
            : await getEmployeeDashboardStats();

        setStats(response.data);

        if (role === "ADMIN") {
          const departmentResponse = await getEmployeesByDepartment();

          setDepartmentData(
            departmentResponse.data.map((item: any) => ({
              department: item.department,
              count: Number(item.count),
            })),
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, [role]);

  if (!stats) {
    return (
      <Layout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const statItems =
    role === "ADMIN"
      ? [
          {
            label: "Total Employees",
            value: (stats as DashboardStats).totalEmployees,
            color: "#6366f1",
          },
          {
            label: "Total Departments",
            value: (stats as DashboardStats).totalDepartments,
            color: "#a855f7",
          },
          {
            label: "Total Leaves",
            value: (stats as DashboardStats).totalLeaves,
            color: "#3b82f6",
          },
          {
            label: "Pending Leaves",
            value: (stats as DashboardStats).pendingLeaves,
            color: "#ff9800",
          },
          {
            label: "Approved Leaves",
            value: (stats as DashboardStats).approvedLeaves,
            color: "#10b981",
          },
          {
            label: "Rejected Leaves",
            value: (stats as DashboardStats).rejectedLeaves,
            color: "#ef4444",
          },
        ]
      : [
          {
            label: "Applied Leaves",
            value: (stats as EmployeeDashboardStats).appliedLeaves,
            color: "#3b82f6",
          },
          {
            label: "Approved Leaves",
            value: (stats as EmployeeDashboardStats).approvedLeaves,
            color: "#10b981",
          },
          {
            label: "Rejected Leaves",
            value: (stats as EmployeeDashboardStats).rejectedLeaves,
            color: "#ef4444",
          },
          {
            label: "Remaining Leaves",
            value: (stats as EmployeeDashboardStats).remainingLeaves,
            color: "#6366f1",
          },
        ];
  const handleCardClick = (label: string) => {
    switch (label) {
      case "Total Employees":
        navigate("/employees");
        break;

      case "Total Departments":
        navigate("/departments");
        break;

      case "Total Leaves":
      case "Applied Leaves":
        navigate("/leaves");
        break;

      case "Pending Leaves":
        navigate("/leaves?status=PENDING");
        break;

      case "Approved Leaves":
        navigate("/leaves?status=APPROVED");
        break;

      case "Rejected Leaves":
        navigate("/leaves?status=REJECTED");
        break;

      default:
        break;
    }
  };
  const chartData =
    role === "ADMIN"
      ? [
          {
            name: "Pending",
            value: (stats as DashboardStats).pendingLeaves,
          },
          {
            name: "Approved",
            value: (stats as DashboardStats).approvedLeaves,
          },
          {
            name: "Rejected",
            value: (stats as DashboardStats).rejectedLeaves,
          },
        ]
      : [
          {
            name: "Applied",
            value: (stats as EmployeeDashboardStats).appliedLeaves,
          },
          {
            name: "Approved",
            value: (stats as EmployeeDashboardStats).approvedLeaves,
          },
          {
            name: "Rejected",
            value: (stats as EmployeeDashboardStats).rejectedLeaves,
          },
          {
            name: "Remaining",
            value: (stats as EmployeeDashboardStats).remainingLeaves,
          },
        ];

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Dashboard Overview
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Quick system metrics and summaries.
          </Typography>
        </Box>

        {/* Dashboard Cards */}
        <Grid container spacing={3}>
          {statItems.map((item) => (
            <Grid
              key={item.label}
              size={{
                xs: 12,
                sm: 6,
                md: 4,
              }}
            >
              <Card
                onClick={() => handleCardClick(item.label)}
                sx={{
                  position: "relative",
                  background: "rgba(24,24,27,0.65)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: item.color,
                    borderTopLeftRadius: "inherit",
                    borderTopRightRadius: "inherit",
                  }}
                />

                <CardContent sx={{ p: 3, pt: 4 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pie Chart */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                background: "rgba(24,24,27,0.65)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                  }}
                >
                  Leave Statistics
                </Typography>

                <LeaveStatusChart data={chartData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Department Chart */}
        {role === "ADMIN" && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card
                sx={{
                  background: "rgba(24,24,27,0.65)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                    }}
                  >
                    Employees By Department
                  </Typography>

                  <DepartmentChart data={departmentData} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Layout>
  );
}

export default DashboardPage;
