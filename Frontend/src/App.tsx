import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import EmployeesPage from "./pages/EmployeesPage";
import LeavesPage from "./pages/LeavePage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["EMPLOYEE"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <LeavesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
